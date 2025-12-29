<template>
  <Layout>
    <div class="home">
      <h1>高校实习管理系统</h1>
      <p>University Internship Management System</p>
      
      <!-- 图片轮播区域 -->
      <div 
        class="carousel-container"
        @mouseenter="stopAutoSlide"
        @mouseleave="startAutoSlide"
      >
        <div class="carousel">
          <div 
            class="carousel-slide" 
            v-for="(image, index) in images" 
            :key="index"
            :class="{ active: currentSlide === index }"
          >
            <img :src="image.path" :alt="image.alt" />
          </div>
        </div>
        
        <!-- 轮播控制按钮 -->
        <button class="carousel-btn prev" @click="prevSlide">❮</button>
        <button class="carousel-btn next" @click="nextSlide">❯</button>
        
        <!-- 指示器 -->
        <div class="carousel-indicators">
          <span 
            v-for="(image, index) in images" 
            :key="index"
            class="indicator"
            :class="{ active: currentSlide === index }"
            @click="goToSlide(index)"
          ></span>
        </div>
      </div>
      
      <!-- 功能组件区域 -->
      <div class="features-section">
        <div class="features-container">
          <!-- 左侧组件 -->
          <div class="left-features">
            <!-- 学生实习填报组件 -->
            <div class="feature-card">
              <div class="feature-icon">📚</div>
              <h3 class="feature-title">学生实习填报</h3>
              <p class="feature-description">学生实习填报和选择，过程管理，实习日志，实习文件</p>
              <ul class="feature-list">
                <li>实习岗位选择</li>
                <li>过程跟踪管理</li>
                <li>实习日志记录</li>
                <li>文件上传管理</li>
              </ul>
            </div>
            
            <!-- 教师管理实习组件 -->
            <div class="feature-card">
              <div class="feature-icon">👨‍🏫</div>
              <h3 class="feature-title">教师管理实习</h3>
              <p class="feature-description">管理审核学生信息，审批申请，监督学生，统计报表</p>
              <ul class="feature-list">
                <li>学生信息审核</li>
                <li>申请审批处理</li>
                <li>实习监督管理</li>
                <li>数据统计分析</li>
              </ul>
            </div>
            
            <!-- 企业岗位发布组件 -->
            <div class="feature-card">
              <div class="feature-icon">🏢</div>
              <h3 class="feature-title">企业岗位发布</h3>
              <p class="feature-description">企业上传实习岗位，岗位管理，学生查看</p>
              <ul class="feature-list">
                <li>岗位信息发布</li>
                <li>岗位状态管理</li>
                <li>学生申请查看</li>
                <li>企业资质认证</li>
              </ul>
            </div>
          </div>
          
          <!-- 右侧组件 -->
          <div class="right-features">
            <!-- 系统统计仪表板 -->
            <div class="feature-card dashboard">
              <div class="feature-icon">📊</div>
              <h3 class="feature-title">数据统计仪表板</h3>
              <p class="feature-description">实时数据监控与分析，可视化展示</p>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">560</div>
                  <div class="stat-label">学生总数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">43</div>
                  <div class="stat-label">企业数量</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">570</div>
                  <div class="stat-label">发布岗位</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">150</div>
                  <div class="stat-label">教师数量</div>
                </div>
              </div>
            </div>
            
            <!-- 最新通知公告 -->
            <div class="feature-card">
              <div class="feature-icon">📢</div>
              <h3 class="feature-title">最新通知公告</h3>
              <p class="feature-description">系统通知与重要公告信息</p>
              <div class="announcement-list">
                <div class="announcement-item">
                  <div class="announcement-title">关于2025年春季实习安排的通知</div>
                  <div class="announcement-date">2025-12-28</div>
                </div>
                <div class="announcement-item">
                  <div class="announcement-title">企业实习岗位招聘会即将开始</div>
                  <div class="announcement-date">2025-12-25</div>
                </div>
                <div class="announcement-item">
                  <div class="announcement-title">系统维护升级完成</div>
                  <div class="announcement-date">2025-12-20</div>
                </div>
                <div class="announcement-item">
                  <div class="announcement-title">2025年优秀实习生评选活动通知</div>
                  <div class="announcement-date">2025-12-15</div>
                </div>
                <div class="announcement-item">
                  <div class="announcement-title">寒假企业实习申请开放</div>
                  <div class="announcement-date">2025-12-10</div>
                </div>
              </div>
            </div>
            
            
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Layout from '@/components/common/Layout.vue';

// 图片数据
const images = [
  {
    path: '/images/微信图片_2025-12-29_144019_182.jpg',
    alt: '实习场景1'
  },
  {
    path: '/images/微信图片_20251229144305_2905_47.png',
    alt: '实习场景2'
  },
  {
    path: '/images/微信图片_20251229144312_2909_47.png',
    alt: '实习场景3'
  }
];

// 轮播控制
const currentSlide = ref(0);
let intervalId = null;

// 自动轮播
const startAutoSlide = () => {
  intervalId = setInterval(() => {
    nextSlide();
  }, 4000); // 每4秒切换一次
};

// 停止自动轮播
const stopAutoSlide = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};

// 下一张图片
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % images.length;
};

// 上一张图片
const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0 ? images.length - 1 : currentSlide.value - 1;
};

// 跳转到指定图片
const goToSlide = (index) => {
  currentSlide.value = index;
};

// 生命周期钩子
onMounted(() => {
  startAutoSlide();
});

onUnmounted(() => {
  stopAutoSlide();
});
</script>

<style scoped>
.home {
  text-align: center;
  padding: 20px;
}

/* 轮播容器样式 */
.carousel-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 40px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.carousel-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.carousel-container:hover .carousel-btn {
  opacity: 1;
}

.carousel-container:hover .carousel-indicators {
  transform: translateX(-50%) scale(1.05);
}

.carousel {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: all 0.8s ease-in-out;
  transform: scale(0.95);
}

.carousel-slide.active {
  opacity: 1;
  transform: scale(1);
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.5s ease;
}

.carousel-container:hover .carousel-slide.active img {
  transform: scale(1.05);
}

/* 控制按钮样式 */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.6);
  border: none;
  color: #333;
  font-size: 18px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  opacity: 0.7;
}

.carousel-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-50%) scale(1.15);
  opacity: 1;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.carousel-btn.prev {
  left: 15px;
}

.carousel-btn.next {
  right: 15px;
}

/* 指示器样式 */
.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
  position: relative;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

.indicator.active {
  background: #409eff;
  width: 24px;
  border-radius: 5px;
  border-color: #409eff;
  transform: scale(1.1);
}

.indicator.active:hover {
  background: #5bb3ff;
  transform: scale(1.15);
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.8);
}

h1 {
  color: #409eff;
  margin-bottom: 15px;
  margin-top: 20px;
}

.home p {
  color: #666;
  margin-bottom: 30px;
  margin-top: 10px;
  font-size: 16px;
}

.info {
  margin-top: 30px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel {
    height: 300px;
  }
  
  .carousel-btn {
    width: 35px;
    height: 35px;
    font-size: 16px;
  }
  
  .carousel-btn.prev {
    left: 10px;
  }
  
  .carousel-btn.next {
    right: 10px;
  }
  
  .home {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .carousel {
    height: 200px;
  }
  
  .carousel-container {
    margin-bottom: 20px;
  }
}

/* 功能组件区域样式 */
.features-section {
  margin-top: 60px;
  padding: 0 20px;
}

.features-container {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.left-features, .right-features {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.feature-card {
  background: #fff;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  font-size: 36px;
  margin-bottom: 15px;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.feature-title {
  color: #333;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.feature-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.6;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  color: #555;
  padding: 8px 0;
  position: relative;
  padding-left: 20px;
  font-size: 14px;
}

.feature-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #409eff;
  font-weight: bold;
}

/* 右侧特色组件样式 */
.dashboard {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.dashboard .feature-title,
.dashboard .feature-description {
  color: #fff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.announcement-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #409eff;
}

.announcement-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  font-weight: 500;
}

.announcement-date {
  font-size: 12px;
  color: #999;
}



/* 响应式设计 */
@media (max-width: 968px) {
  .features-container {
    flex-direction: column;
  }
  
  .left-features, .right-features {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .features-section {
    padding: 0 15px;
    margin-top: 40px;
  }
  
  .feature-card {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  

}
</style>
