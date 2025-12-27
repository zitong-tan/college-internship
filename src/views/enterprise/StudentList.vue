<template>
  <Layout>
    <div class="student-list">
      <div class="page-header">
        <h1>实习学生</h1>
      </div>

      <el-card>
        <el-table
          v-loading="loading"
          :data="students"
          style="width: 100%"
        >
          <el-table-column prop="student_number" label="学号" width="120" />
          <el-table-column prop="real_name" label="姓名" width="120" />
          <el-table-column prop="position_title" label="实习岗位" min-width="200" />
          <el-table-column prop="start_date" label="开始日期" width="120">
            <template #default="{ row }">
              {{ formatDate(row.start_date) }}
            </template>
          </el-table-column>
          <el-table-column prop="end_date" label="结束日期" width="120">
            <template #default="{ row }">
              {{ formatDate(row.end_date) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="enterprise_score" label="企业评分" width="100" align="center">
            <template #default="{ row }">
              {{ row.enterprise_score != null ? Number(row.enterprise_score).toFixed(1) : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleViewDetail(row)">
                查看详情
              </el-button>
              <el-button 
                v-if="row.status === 'pending_evaluation' && !row.enterprise_score"
                link 
                type="success" 
                size="small" 
                @click="handleEvaluate(row)"
              >
                评价
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>

      <!-- Student Detail Dialog -->
      <el-dialog
        v-model="detailVisible"
        title="学生详情"
        width="700px"
      >
        <div v-if="currentStudent" class="student-detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="学号">
              {{ currentStudent.student_number }}
            </el-descriptions-item>
            <el-descriptions-item label="姓名">
              {{ currentStudent.real_name }}
            </el-descriptions-item>
            <el-descriptions-item label="专业">
              {{ currentStudent.major || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="年级">
              {{ currentStudent.grade || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="班级">
              {{ currentStudent.class_name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系方式">
              {{ currentStudent.phone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="实习岗位" :span="2">
              {{ currentStudent.position_title }}
            </el-descriptions-item>
            <el-descriptions-item label="实习期限" :span="2">
              {{ formatDate(currentStudent.start_date) }} 至 {{ formatDate(currentStudent.end_date) }}
            </el-descriptions-item>
            <el-descriptions-item label="实习状态" :span="2">
              <el-tag :type="getStatusType(currentStudent.status)">
                {{ getStatusText(currentStudent.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="教师评分">
              {{ currentStudent.teacher_score != null ? Number(currentStudent.teacher_score).toFixed(1) : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="企业评分">
              {{ currentStudent.enterprise_score != null ? Number(currentStudent.enterprise_score).toFixed(1) : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="综合评分" :span="2">
              {{ currentStudent.final_score != null ? Number(currentStudent.final_score).toFixed(1) : '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-dialog>

      <!-- Evaluation Form Dialog -->
      <EnterpriseEvaluation
        v-model:visible="evaluationVisible"
        :internship="currentStudent"
        @success="handleEvaluationSuccess"
      />
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import Layout from '@/components/common/Layout.vue';
import EnterpriseEvaluation from '@/components/enterprise/EnterpriseEvaluation.vue';
import { getInternships } from '@/api/internship';

const loading = ref(false);
const students = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const detailVisible = ref(false);
const evaluationVisible = ref(false);
const currentStudent = ref(null);

// Fetch students list
const fetchStudents = async () => {
  loading.value = true;
  try {
    const response = await getInternships({
      page: currentPage.value,
      pageSize: pageSize.value
    });
    
    if (response.success) {
      const data = response.data;
      const internships = data.internships || [];
      
      // Transform internship data to student data
      students.value = internships.map(internship => ({
        id: internship.id,
        student_id: internship.student_id,
        student_number: internship.Student?.student_number || '-',
        real_name: internship.Student?.User?.real_name || '-',
        major: internship.Student?.major,
        grade: internship.Student?.grade,
        class_name: internship.Student?.class_name,
        phone: internship.Student?.User?.phone,
        position_title: internship.Position?.title || '-',
        start_date: internship.start_date,
        end_date: internship.end_date,
        status: internship.status,
        teacher_score: internship.teacher_score,
        enterprise_score: internship.enterprise_score,
        final_score: internship.final_score
      }));
      
      total.value = data.total || 0;
    }
  } catch (error) {
    ElMessage.error('获取学生列表失败');
    console.error('Failed to fetch students:', error);
  } finally {
    loading.value = false;
  }
};

// Handle view detail
const handleViewDetail = (student) => {
  currentStudent.value = student;
  detailVisible.value = true;
};

// Handle evaluate
const handleEvaluate = (student) => {
  currentStudent.value = student;
  evaluationVisible.value = true;
};

// Handle evaluation success
const handleEvaluationSuccess = () => {
  evaluationVisible.value = false;
  currentStudent.value = null;
  fetchStudents();
};

// Handle page change
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchStudents();
};

// Handle page size change
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchStudents();
};

// Format date
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN');
};

// Get status type for tag
const getStatusType = (status) => {
  const types = {
    ongoing: 'primary',
    pending_evaluation: 'warning',
    completed: 'success'
  };
  return types[status] || 'info';
};

// Get status text
const getStatusText = (status) => {
  const texts = {
    ongoing: '进行中',
    pending_evaluation: '待评价',
    completed: '已完成'
  };
  return texts[status] || status;
};

onMounted(() => {
  fetchStudents();
});
</script>

<style scoped>
.student-list {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.student-detail {
  padding: 10px 0;
}
</style>
