<template>
  <Layout>
    <div class="statistics-container">
      <!-- Header with filters -->
      <div class="header-section">
        <h1>统计报表</h1>
        <div class="filters">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 300px; margin-right: 16px"
            @change="handleDateChange"
          />
          <el-select
            v-model="periodFilter"
            placeholder="统计周期"
            style="width: 150px; margin-right: 16px"
            @change="handleSearch"
          >
            <el-option label="本月" value="month" />
            <el-option label="本学期" value="semester" />
            <el-option label="本年" value="year" />
            <el-option label="全部" value="all" />
          </el-select>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button type="success" @click="handleExport" :loading="exporting">
            <el-icon><Download /></el-icon>
            导出报表
          </el-button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-cards" v-loading="loading">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff20">
              <el-icon :size="32" color="#409eff"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalApplications || 0 }}</div>
              <div class="stat-label">申请总数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a20">
              <el-icon :size="32" color="#67c23a"><Select /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.approvedApplications || 0 }}</div>
              <div class="stat-label">已批准</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f56c6c20">
              <el-icon :size="32" color="#f56c6c"><Close /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.rejectedApplications || 0 }}</div>
              <div class="stat-label">已拒绝</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c20">
              <el-icon :size="32" color="#e6a23c"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pendingApplications || 0 }}</div>
              <div class="stat-label">待审批</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #90939920">
              <el-icon :size="32" color="#909399"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalStudents || 0 }}</div>
              <div class="stat-label">学生总数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff20">
              <el-icon :size="32" color="#409eff"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalEnterprises || 0 }}</div>
              <div class="stat-label">企业总数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a20">
              <el-icon :size="32" color="#67c23a"><Briefcase /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalPositions || 0 }}</div>
              <div class="stat-label">岗位总数</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c20">
              <el-icon :size="32" color="#e6a23c"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ approvalRate }}</div>
              <div class="stat-label">通过率</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <el-row :gutter="24">
          <!-- Application Status Chart -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>申请状态分布</span>
                </div>
              </template>
              <div ref="statusChartRef" class="chart-container"></div>
            </el-card>
          </el-col>

          <!-- Enterprise Distribution Chart -->
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>企业岗位分布</span>
                </div>
              </template>
              <div ref="enterpriseChartRef" class="chart-container"></div>
            </el-card>
          </el-col>

          <!-- Monthly Trend Chart -->
          <el-col :xs="24" :sm="24" :md="24" :lg="24">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>月度申请趋势</span>
                </div>
              </template>
              <div ref="trendChartRef" class="chart-container" style="height: 350px"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- Enterprise Details Table -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <span>企业详细统计</span>
          </div>
        </template>
        <el-table
          :data="statistics.enterpriseDetails || []"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="company_name" label="企业名称" min-width="200" />
          <el-table-column prop="position_count" label="岗位数量" width="120" align="center" />
          <el-table-column prop="student_count" label="实习学生数" width="120" align="center" />
          <el-table-column prop="application_count" label="申请数量" width="120" align="center" />
          <el-table-column label="通过率" width="120" align="center">
            <template #default="{ row }">
              {{ calculateRate(row.approved_count, row.application_count) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Refresh,
  Download,
  Document,
  Select,
  Close,
  Clock,
  User,
  OfficeBuilding,
  Briefcase,
  TrendCharts
} from '@element-plus/icons-vue';
import Layout from '@/components/common/Layout.vue';
import { getStatistics, exportReport } from '@/api/statistics';
import * as echarts from 'echarts';

// Data
const loading = ref(false);
const exporting = ref(false);
const statistics = ref({});
const dateRange = ref([]);
const periodFilter = ref('semester');

// Chart refs
const statusChartRef = ref(null);
const enterpriseChartRef = ref(null);
const trendChartRef = ref(null);

// Chart instances
let statusChart = null;
let enterpriseChart = null;
let trendChart = null;

// Computed
const approvalRate = computed(() => {
  const total = statistics.value.totalApplications || 0;
  const approved = statistics.value.approvedApplications || 0;
  if (total === 0) return '0%';
  return ((approved / total) * 100).toFixed(1) + '%';
});

// Methods
const fetchStatistics = async () => {
  loading.value = true;
  try {
    const params = {
      period: periodFilter.value
    };
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0].toISOString().split('T')[0];
      params.end_date = dateRange.value[1].toISOString().split('T')[0];
    }
    
    const response = await getStatistics(params);
    statistics.value = response.data || {};
    
    // Update charts after data is loaded
    await nextTick();
    initCharts();
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
    ElMessage.error('获取统计数据失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  fetchStatistics();
};

const handleDateChange = () => {
  periodFilter.value = '';
  fetchStatistics();
};

const handleExport = async () => {
  exporting.value = true;
  try {
    const params = {
      period: periodFilter.value,
      format: 'excel'
    };
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0].toISOString().split('T')[0];
      params.end_date = dateRange.value[1].toISOString().split('T')[0];
    }
    
    const response = await exportReport(params);
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `统计报表_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('报表导出成功');
  } catch (error) {
    console.error('Failed to export report:', error);
    ElMessage.error('报表导出失败');
  } finally {
    exporting.value = false;
  }
};

const calculateRate = (approved, total) => {
  if (!total || total === 0) return '0%';
  return ((approved / total) * 100).toFixed(1) + '%';
};

const initCharts = () => {
  initStatusChart();
  initEnterpriseChart();
  initTrendChart();
};

const initStatusChart = () => {
  if (!statusChartRef.value) return;
  
  if (statusChart) {
    statusChart.dispose();
  }
  
  statusChart = echarts.init(statusChartRef.value);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '申请状态',
        type: 'pie',
        radius: '60%',
        data: [
          { value: statistics.value.pendingApplications || 0, name: '待审批' },
          { value: statistics.value.approvedApplications || 0, name: '已批准' },
          { value: statistics.value.rejectedApplications || 0, name: '已拒绝' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  statusChart.setOption(option);
};

const initEnterpriseChart = () => {
  if (!enterpriseChartRef.value) return;
  
  if (enterpriseChart) {
    enterpriseChart.dispose();
  }
  
  enterpriseChart = echarts.init(enterpriseChartRef.value);
  
  const enterpriseData = statistics.value.enterpriseDetails || [];
  const topEnterprises = enterpriseData.slice(0, 10);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: topEnterprises.map(e => e.company_name)
    },
    series: [
      {
        name: '岗位数量',
        type: 'bar',
        data: topEnterprises.map(e => e.position_count),
        itemStyle: {
          color: '#409eff'
        }
      }
    ]
  };
  
  enterpriseChart.setOption(option);
};

const initTrendChart = () => {
  if (!trendChartRef.value) return;
  
  if (trendChart) {
    trendChart.dispose();
  }
  
  trendChart = echarts.init(trendChartRef.value);
  
  const monthlyData = statistics.value.monthlyTrend || [];
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['申请数量', '批准数量', '拒绝数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: monthlyData.map(m => m.month)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '申请数量',
        type: 'line',
        data: monthlyData.map(m => m.total),
        smooth: true,
        itemStyle: {
          color: '#409eff'
        }
      },
      {
        name: '批准数量',
        type: 'line',
        data: monthlyData.map(m => m.approved),
        smooth: true,
        itemStyle: {
          color: '#67c23a'
        }
      },
      {
        name: '拒绝数量',
        type: 'line',
        data: monthlyData.map(m => m.rejected),
        smooth: true,
        itemStyle: {
          color: '#f56c6c'
        }
      }
    ]
  };
  
  trendChart.setOption(option);
};

// Handle window resize
const handleResize = () => {
  statusChart?.resize();
  enterpriseChart?.resize();
  trendChart?.resize();
};

// Lifecycle
onMounted(() => {
  fetchStatistics();
  window.addEventListener('resize', handleResize);
});

// Cleanup
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  statusChart?.dispose();
  enterpriseChart?.dispose();
  trendChart?.dispose();
});
</script>

<style scoped>
.statistics-container {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

.header-section h1 {
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
}

.filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  margin-bottom: 24px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.table-card {
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style>
