<template>
  <Layout>
    <div class="home">
      <h1>高校实习管理系统</h1>
      <p>University Internship Management System</p>
      <div class="info">
        <p>系统正在开发中...</p>
        <p>System under development...</p>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import Layout from '@/components/common/Layout.vue';
</script>

<style scoped>
.home {
  text-align: center;
  padding: 50px;
}

h1 {
  color: #409eff;
  margin-bottom: 20px;
}

.info {
  margin-top: 40px;
  color: #666;
}
</style>
