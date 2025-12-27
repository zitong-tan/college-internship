<template>
  <el-card class="skeleton-card" shadow="hover">
    <el-skeleton :rows="rows" animated :loading="true">
      <template #template>
        <el-skeleton-item variant="h3" style="width: 60%; margin-bottom: 16px;" />
        <el-skeleton-item variant="text" style="width: 100%; margin-bottom: 8px;" />
        <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 8px;" />
        <el-skeleton-item variant="text" style="width: 90%; margin-bottom: 16px;" />
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <el-skeleton-item variant="button" style="width: 80px;" />
          <el-skeleton-item variant="button" style="width: 80px;" />
        </div>
      </template>
    </el-skeleton>
  </el-card>
</template>

<script>
export default {
  name: 'SkeletonCard',
  props: {
    rows: {
      type: Number,
      default: 3
    }
  }
};
</script>

<style scoped>
.skeleton-card {
  margin-bottom: 16px;
}
</style>
