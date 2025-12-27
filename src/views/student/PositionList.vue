<template>
  <Layout>
    <div class="page-container">
      <h1>实习岗位</h1>
      
      <!-- Search and Filter Section -->
      <el-card class="filter-card" shadow="never">
        <el-form :inline="true" :model="filters" class="filter-form">
          <el-form-item label="搜索">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索岗位名称或描述"
              clearable
              style="width: 300px"
              @clear="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="企业">
            <el-input
              v-model="filters.enterprise"
              placeholder="企业名称"
              clearable
              style="width: 200px"
              @clear="handleSearch"
            />
          </el-form-item>
          
          <el-form-item label="岗位类型">
            <el-select
              v-model="filters.type"
              placeholder="选择类型"
              clearable
              style="width: 150px"
              @change="handleSearch"
            >
              <el-option label="全职" value="full-time" />
              <el-option label="兼职" value="part-time" />
              <el-option label="远程" value="remote" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select
              v-model="filters.status"
              placeholder="选择状态"
              clearable
              style="width: 150px"
              @change="handleSearch"
            >
              <el-option label="开放中" value="open" />
              <el-option label="已满" value="full" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Position List -->
      <div v-loading="loading" class="position-list">
        <el-empty v-if="!loading && positions.length === 0" description="暂无岗位" />
        
        <el-card
          v-for="position in positions"
          :key="position.id"
          class="position-card"
          shadow="hover"
          @click="viewDetail(position.id)"
        >
          <div class="position-header">
            <div class="position-title-section">
              <h3 class="position-title">{{ position.title }}</h3>
              <el-tag
                :type="getStatusType(position.status)"
                size="small"
                class="status-tag"
              >
                {{ getStatusText(position.status) }}
              </el-tag>
            </div>
            <div class="position-company">
              <el-icon><OfficeBuilding /></el-icon>
              {{ position.enterprise?.company_name || '未知企业' }}
            </div>
          </div>
          
          <div class="position-content">
            <p class="position-description">{{ position.description }}</p>
            
            <div class="position-info">
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(position.start_date) }} 至 {{ formatDate(position.end_date) }}</span>
              </div>
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>名额: {{ position.available_slots }}/{{ position.total_slots }}</span>
              </div>
              <div class="info-item">
                <el-icon><Clock /></el-icon>
                <span>发布于 {{ formatDate(position.created_at) }}</span>
              </div>
            </div>
          </div>
          
          <div class="position-footer">
            <el-button
              type="primary"
              size="small"
              :disabled="position.status !== 'open' || position.available_slots === 0"
              @click.stop="applyPosition(position)"
            >
              立即申请
            </el-button>
            <el-button size="small" @click.stop="viewDetail(position.id)">
              查看详情
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- Pagination -->
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, OfficeBuilding, Calendar, User, Clock } from '@element-plus/icons-vue';
import Layout from '@/components/common/Layout.vue';
import { getPositions } from '@/api/position';

const router = useRouter();

// State
const loading = ref(false);
const positions = ref([]);
const total = ref(0);

const filters = reactive({
  keyword: '',
  enterprise: '',
  type: '',
  status: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10
});

// Methods
const fetchPositions = async () => {
  loading.value = true;
  console.log('🔄 Starting fetchPositions...');
  console.log('Current loading state:', loading.value);
  console.log('Current positions:', positions.value);
  
  try {
    const params = {
      page: pagination.page,
      limit: pagination.pageSize,
      ...filters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });
    
    console.log('📤 Fetching positions with params:', params);
    const response = await getPositions(params);
    console.log('📥 Positions response:', response);
    console.log('Response structure:', {
      success: response.success,
      hasData: !!response.data,
      hasPositions: !!response.data?.positions,
      positionsLength: response.data?.positions?.length,
      hasPagination: !!response.data?.pagination
    });
    
    if (response.success) {
      const newPositions = response.data.positions || response.data.rows || [];
      const newTotal = response.data.pagination?.total || response.data.total || 0;
      
      console.log('✅ Setting positions:', newPositions.length, 'items');
      console.log('First position:', newPositions[0]);
      
      positions.value = newPositions;
      total.value = newTotal;
      
      console.log('✅ Positions set! Current value:', positions.value.length);
      console.log('Total:', total.value);
      
      // Force Vue to update
      setTimeout(() => {
        console.log('🔍 After timeout - positions:', positions.value.length);
      }, 100);
    } else {
      console.error('❌ Response not successful:', response);
    }
  } catch (error) {
    console.error('❌ Failed to fetch positions:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    ElMessage.error('获取岗位列表失败');
  } finally {
    loading.value = false;
    console.log('✅ Loading complete. Final state:', {
      loading: loading.value,
      positionsCount: positions.value.length,
      total: total.value
    });
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchPositions();
};

const handleReset = () => {
  filters.keyword = '';
  filters.enterprise = '';
  filters.type = '';
  filters.status = '';
  pagination.page = 1;
  fetchPositions();
};

const handlePageChange = (page) => {
  pagination.page = page;
  fetchPositions();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchPositions();
};

const viewDetail = (id) => {
  router.push(`/student/positions/${id}`);
};

const applyPosition = (position) => {
  router.push({
    path: `/student/positions/${position.id}`,
    query: { apply: 'true' }
  });
};

const getStatusType = (status) => {
  const types = {
    open: 'success',
    full: 'warning',
    closed: 'info'
  };
  return types[status] || 'info';
};

const getStatusText = (status) => {
  const texts = {
    open: '开放中',
    full: '已满',
    closed: '已关闭'
  };
  return texts[status] || status;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};

// Lifecycle
onMounted(() => {
  console.log('🚀 Component mounted');
  fetchPositions();
});

// Watch positions for changes
watch(positions, (newVal, oldVal) => {
  console.log('👀 Positions changed:', {
    oldLength: oldVal?.length || 0,
    newLength: newVal?.length || 0,
    newValue: newVal
  });
}, { deep: true });

watch(loading, (newVal) => {
  console.log('⏳ Loading changed:', newVal);
});
</script>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 24px;
  color: #303133;
}

.filter-card {
  margin-bottom: 24px;
}

.filter-form {
  margin: 0;
}

.position-list {
  min-height: 400px;
}

.position-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.position-card:hover {
  transform: translateY(-2px);
}

.position-header {
  margin-bottom: 16px;
}

.position-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.position-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.status-tag {
  flex-shrink: 0;
}

.position-company {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.position-content {
  margin-bottom: 16px;
}

.position-description {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.position-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
}

.position-footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
