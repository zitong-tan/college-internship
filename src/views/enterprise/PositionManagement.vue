<template>
  <Layout>
    <div class="position-management">
      <div class="page-header">
        <h1>岗位管理</h1>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          发布新岗位
        </el-button>
      </div>

      <el-card>
        <el-table
          v-loading="loading"
          :data="positions"
          style="width: 100%"
        >
          <el-table-column prop="title" label="岗位名称" min-width="200" />
          <el-table-column prop="total_slots" label="总名额" width="100" align="center" />
          <el-table-column prop="available_slots" label="剩余名额" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.available_slots > 0 ? 'success' : 'danger'">
                {{ row.available_slots }}
              </el-tag>
            </template>
          </el-table-column>
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
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">
                删除
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

      <!-- Position Form Dialog -->
      <PositionForm
        v-model:visible="formVisible"
        :position="currentPosition"
        @success="handleFormSuccess"
      />
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import Layout from '@/components/common/Layout.vue';
import PositionForm from '@/components/enterprise/PositionForm.vue';
import { getPositions, deletePosition } from '@/api/position';

const loading = ref(false);
const positions = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const formVisible = ref(false);
const currentPosition = ref(null);

// Fetch positions list
const fetchPositions = async () => {
  loading.value = true;
  try {
    const response = await getPositions({
      page: currentPage.value,
      pageSize: pageSize.value
    });
    
    if (response.success) {
      const data = response.data;
      positions.value = data.positions || [];
      total.value = data.pagination?.total || data.total || 0;
    }
  } catch (error) {
    ElMessage.error('获取岗位列表失败');
    console.error('Failed to fetch positions:', error);
  } finally {
    loading.value = false;
  }
};

// Handle create position
const handleCreate = () => {
  currentPosition.value = null;
  formVisible.value = true;
};

// Handle edit position
const handleEdit = (position) => {
  currentPosition.value = { ...position };
  formVisible.value = true;
};

// Handle delete position
const handleDelete = async (position) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该岗位吗？如果有待处理的申请，将无法删除。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const response = await deletePosition(position.id);
    if (response.data.success) {
      ElMessage.success('删除成功');
      fetchPositions();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error?.message || '删除失败');
    }
  }
};

// Handle form success
const handleFormSuccess = () => {
  formVisible.value = false;
  fetchPositions();
};

// Handle page change
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchPositions();
};

// Handle page size change
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchPositions();
};

// Format date
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN');
};

// Get status type for tag
const getStatusType = (status) => {
  const types = {
    open: 'success',
    full: 'warning',
    closed: 'info'
  };
  return types[status] || 'info';
};

// Get status text
const getStatusText = (status) => {
  const texts = {
    open: '开放',
    full: '已满',
    closed: '关闭'
  };
  return texts[status] || status;
};

onMounted(() => {
  fetchPositions();
});
</script>

<style scoped>
.position-management {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
</style>
