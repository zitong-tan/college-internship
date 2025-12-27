<template>
  <div class="internship-progress">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><TrendCharts /></el-icon>
          <span>实习进度</span>
        </div>
      </template>
      
      <div class="progress-content">
        <!-- Progress Bar -->
        <div class="progress-section">
          <el-progress
            :percentage="progressPercentage"
            :color="progressColor"
            :stroke-width="20"
            :text-inside="true"
          />
        </div>
        
        <!-- Progress Info -->
        <div class="info-grid">
          <div class="info-card">
            <div class="info-icon start">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="info-content">
              <div class="info-label">开始日期</div>
              <div class="info-value">{{ formatDate(startDate) }}</div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="info-icon end">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="info-content">
              <div class="info-label">结束日期</div>
              <div class="info-value">{{ formatDate(endDate) }}</div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="info-icon days">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="info-content">
              <div class="info-label">已完成天数</div>
              <div class="info-value">{{ completedDays }} 天</div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="info-icon total">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="info-content">
              <div class="info-label">总天数</div>
              <div class="info-value">{{ totalDays }} 天</div>
            </div>
          </div>
        </div>
        
        <!-- Status Info -->
        <div class="status-section">
          <el-alert
            :type="statusAlertType"
            :closable="false"
            show-icon
          >
            <template #title>
              {{ statusMessage }}
            </template>
          </el-alert>
        </div>
        
        <!-- Timeline -->
        <div class="timeline-section">
          <div class="timeline-header">实习时间线</div>
          <div class="timeline-bar">
            <div class="timeline-start">
              <div class="timeline-marker start"></div>
              <div class="timeline-label">开始</div>
            </div>
            <div class="timeline-progress">
              <div class="timeline-track">
                <div
                  class="timeline-fill"
                  :style="{ width: progressPercentage + '%' }"
                ></div>
                <div
                  class="timeline-current"
                  :style="{ left: progressPercentage + '%' }"
                >
                  <div class="current-marker"></div>
                  <div class="current-label">当前</div>
                </div>
              </div>
            </div>
            <div class="timeline-end">
              <div class="timeline-marker end"></div>
              <div class="timeline-label">结束</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { TrendCharts, Calendar, Clock } from '@element-plus/icons-vue';

const props = defineProps({
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'ongoing'
  }
});

// Computed
const completedDays = computed(() => {
  const start = new Date(props.startDate);
  const today = new Date();
  const end = new Date(props.endDate);
  
  // If not started yet
  if (today < start) {
    return 0;
  }
  
  // If already ended
  if (today > end) {
    return totalDays.value;
  }
  
  // Calculate days between start and today
  const diffTime = Math.abs(today - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

const totalDays = computed(() => {
  const start = new Date(props.startDate);
  const end = new Date(props.endDate);
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

const progressPercentage = computed(() => {
  if (totalDays.value === 0) return 0;
  
  const percentage = (completedDays.value / totalDays.value) * 100;
  return Math.min(Math.round(percentage), 100);
});

const progressColor = computed(() => {
  const percentage = progressPercentage.value;
  
  if (percentage < 30) {
    return '#67C23A'; // Green
  } else if (percentage < 70) {
    return '#409EFF'; // Blue
  } else if (percentage < 90) {
    return '#E6A23C'; // Orange
  } else {
    return '#F56C6C'; // Red
  }
});

const statusAlertType = computed(() => {
  const today = new Date();
  const start = new Date(props.startDate);
  const end = new Date(props.endDate);
  
  if (today < start) {
    return 'info';
  } else if (today > end) {
    return 'warning';
  } else if (progressPercentage.value > 80) {
    return 'warning';
  } else {
    return 'success';
  }
});

const statusMessage = computed(() => {
  const today = new Date();
  const start = new Date(props.startDate);
  const end = new Date(props.endDate);
  
  if (today < start) {
    const daysUntilStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    return `实习尚未开始，距离开始还有 ${daysUntilStart} 天`;
  } else if (today > end) {
    return '实习已结束，请等待评价';
  } else {
    const daysRemaining = totalDays.value - completedDays.value;
    if (daysRemaining <= 7) {
      return `实习即将结束，还剩 ${daysRemaining} 天`;
    } else {
      return `实习进行中，已完成 ${progressPercentage.value}%`;
    }
  }
});

// Methods
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN');
};
</script>

<style scoped>
.internship-progress {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.progress-section {
  padding: 20px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #F5F7FA;
  border-radius: 8px;
  transition: all 0.3s;
}

.info-card:hover {
  background: #E4E7ED;
}

.info-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 24px;
}

.info-icon.start {
  background: #E1F3D8;
  color: #67C23A;
}

.info-icon.end {
  background: #FDE2E2;
  color: #F56C6C;
}

.info-icon.days {
  background: #D9ECFF;
  color: #409EFF;
}

.info-icon.total {
  background: #F4E8D8;
  color: #E6A23C;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.status-section {
  margin: 8px 0;
}

.timeline-section {
  padding: 20px 0;
}

.timeline-header {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.timeline-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-start,
.timeline-end {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.timeline-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid;
}

.timeline-marker.start {
  border-color: #67C23A;
  background: #67C23A;
}

.timeline-marker.end {
  border-color: #F56C6C;
  background: #F56C6C;
}

.timeline-label {
  font-size: 12px;
  color: #909399;
}

.timeline-progress {
  flex: 1;
  position: relative;
}

.timeline-track {
  height: 8px;
  background: #E4E7ED;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.timeline-fill {
  height: 100%;
  background: linear-gradient(90deg, #67C23A 0%, #409EFF 50%, #E6A23C 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.timeline-current {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.current-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #409EFF;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.current-label {
  font-size: 12px;
  font-weight: 600;
  color: #409EFF;
  white-space: nowrap;
  margin-top: 12px;
}
</style>
