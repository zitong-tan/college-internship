<template>
  <Layout>
    <div class="not-found">
      <div class="not-found-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">页面未找到</h2>
        <p class="error-message">抱歉，您访问的页面不存在</p>
        <el-button type="primary" @click="goHome">
          返回首页
        </el-button>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Layout from '@/components/common/Layout.vue';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #409eff;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 32px;
  color: #303133;
  margin: 20px 0 10px;
}

.error-message {
  font-size: 16px;
  color: #909399;
  margin: 0 0 30px;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }
}
</style>
