<template>
  <div class="evaluation-view">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Medal /></el-icon>
          <span>实习评价</span>
        </div>
      </template>
      
      <div v-loading="loading" class="evaluation-content">
        <!-- No Evaluation Yet -->
        <el-empty
          v-if="!loading && !hasEvaluation"
          description="暂无评价"
        />
        
        <!-- Evaluation Content -->
        <template v-if="hasEvaluation">
          <!-- Final Score -->
          <div class="final-score-section">
            <div class="score-card">
              <div class="score-label">综合评分</div>
              <div class="score-value">
                <span class="score-number">{{ finalScore }}</span>
                <span class="score-unit">分</span>
              </div>
              <el-rate
                v-model="ratingStars"
                disabled
                show-score
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                score-template="{value}"
              />
            </div>
          </div>
          
          <!-- Evaluation Grid -->
          <div class="evaluation-grid">
            <!-- Teacher Evaluation -->
            <el-card class="evaluation-card teacher" shadow="hover">
              <template #header>
                <div class="evaluation-header">
                  <el-icon class="header-icon"><User /></el-icon>
                  <span class="header-title">教师评价</span>
                  <el-tag
                    v-if="teacherScore !== null"
                    type="success"
                    size="small"
                  >
                    已评价
                  </el-tag>
                  <el-tag v-else type="info" size="small">
                    待评价
                  </el-tag>
                </div>
              </template>
              
              <div v-if="teacherScore !== null" class="evaluation-body">
                <div class="score-section">
                  <span class="score-label">评分:</span>
                  <span class="score-value">{{ teacherScore }} 分</span>
                  <el-progress
                    :percentage="teacherScore"
                    :color="getScoreColor(teacherScore)"
                    :stroke-width="8"
                  />
                </div>
                
                <div v-if="teacherComment" class="comment-section">
                  <div class="comment-label">评语:</div>
                  <div class="comment-content">{{ teacherComment }}</div>
                </div>
              </div>
              
              <el-empty
                v-else
                description="教师尚未评价"
                :image-size="80"
              />
            </el-card>
            
            <!-- Enterprise Evaluation -->
            <el-card class="evaluation-card enterprise" shadow="hover">
              <template #header>
                <div class="evaluation-header">
                  <el-icon class="header-icon"><OfficeBuilding /></el-icon>
                  <span class="header-title">企业评价</span>
                  <el-tag
                    v-if="enterpriseScore !== null"
                    type="success"
                    size="small"
                  >
                    已评价
                  </el-tag>
                  <el-tag v-else type="info" size="small">
                    待评价
                  </el-tag>
                </div>
              </template>
              
              <div v-if="enterpriseScore !== null" class="evaluation-body">
                <div class="score-section">
                  <span class="score-label">评分:</span>
                  <span class="score-value">{{ enterpriseScore }} 分</span>
                  <el-progress
                    :percentage="enterpriseScore"
                    :color="getScoreColor(enterpriseScore)"
                    :stroke-width="8"
                  />
                </div>
                
                <div v-if="enterpriseComment" class="comment-section">
                  <div class="comment-label">评语:</div>
                  <div class="comment-content">{{ enterpriseComment }}</div>
                </div>
              </div>
              
              <el-empty
                v-else
                description="企业尚未评价"
                :image-size="80"
              />
            </el-card>
          </div>
          
          <!-- Score Calculation Info -->
          <div v-if="finalScore !== null" class="calculation-info">
            <el-alert type="info" :closable="false" show-icon>
              <template #title>
                评分说明
              </template>
              综合评分 = 教师评分 × 50% + 企业评分 × 50% = {{ teacherScore }} × 0.5 + {{ enterpriseScore }} × 0.5 = {{ finalScore }}
            </el-alert>
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Medal, User, OfficeBuilding } from '@element-plus/icons-vue';
import { getEvaluation } from '@/api/internship';

const props = defineProps({
  internshipId: {
    type: [Number, String],
    required: true
  },
  teacherScore: {
    type: Number,
    default: null
  },
  enterpriseScore: {
    type: Number,
    default: null
  },
  finalScore: {
    type: Number,
    default: null
  },
  teacherComment: {
    type: String,
    default: ''
  },
  enterpriseComment: {
    type: String,
    default: ''
  }
});

// State
const loading = ref(false);
const evaluation = ref(null);

// Computed
const hasEvaluation = computed(() => {
  return props.teacherScore !== null || props.enterpriseScore !== null;
});

const ratingStars = computed(() => {
  if (props.finalScore === null) return 0;
  return Math.round(props.finalScore / 20); // Convert 0-100 to 0-5 stars
});

// Methods
const fetchEvaluation = async () => {
  // If props already have evaluation data, no need to fetch
  if (hasEvaluation.value) {
    return;
  }
  
  loading.value = true;
  try {
    const response = await getEvaluation(props.internshipId);
    if (response.success) {
      evaluation.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch evaluation:', error);
    // Don't show error if evaluation doesn't exist yet
    if (error.response?.status !== 404) {
      ElMessage.error('获取评价信息失败');
    }
  } finally {
    loading.value = false;
  }
};

const getScoreColor = (score) => {
  if (score >= 90) {
    return '#67C23A'; // Green
  } else if (score >= 80) {
    return '#409EFF'; // Blue
  } else if (score >= 70) {
    return '#E6A23C'; // Orange
  } else if (score >= 60) {
    return '#F56C6C'; // Red
  } else {
    return '#909399'; // Gray
  }
};

// Lifecycle
onMounted(() => {
  fetchEvaluation();
});

// Watch for internship ID changes
watch(() => props.internshipId, () => {
  fetchEvaluation();
});
</script>

<style scoped>
.evaluation-view {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.evaluation-content {
  min-height: 200px;
}

.final-score-section {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}

.score-card {
  text-align: center;
  padding: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  min-width: 300px;
}

.score-card .score-label {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 16px;
  display: block;
}

.score-card .score-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 16px;
}

.score-card .score-number {
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
}

.score-card .score-unit {
  font-size: 24px;
  margin-left: 8px;
}

.evaluation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.evaluation-card {
  height: 100%;
}

.evaluation-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 18px;
}

.evaluation-card.teacher .header-icon {
  color: #409EFF;
}

.evaluation-card.enterprise .header-icon {
  color: #67C23A;
}

.header-title {
  flex: 1;
  font-weight: 600;
}

.evaluation-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.score-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.score-section .score-label {
  font-size: 14px;
  color: #909399;
}

.score-section .score-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.comment-section {
  padding: 16px;
  background: #F5F7FA;
  border-radius: 8px;
}

.comment-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.comment-content {
  color: #606266;
  line-height: 1.8;
  white-space: pre-wrap;
}

.calculation-info {
  margin-top: 24px;
}
</style>
