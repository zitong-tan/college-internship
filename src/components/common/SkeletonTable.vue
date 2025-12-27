<template>
  <div class="skeleton-table">
    <el-skeleton :rows="rows" animated :loading="true">
      <template #template>
        <!-- Table header -->
        <div class="skeleton-table-header">
          <el-skeleton-item 
            v-for="i in columns" 
            :key="i" 
            variant="text" 
            style="width: 100px; height: 20px;"
          />
        </div>
        <!-- Table rows -->
        <div 
          v-for="row in rows" 
          :key="row" 
          class="skeleton-table-row"
        >
          <el-skeleton-item 
            v-for="col in columns" 
            :key="col" 
            variant="text" 
            style="width: 100px; height: 16px;"
          />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script>
export default {
  name: 'SkeletonTable',
  props: {
    rows: {
      type: Number,
      default: 5
    },
    columns: {
      type: Number,
      default: 4
    }
  }
};
</script>

<style scoped>
.skeleton-table {
  width: 100%;
  padding: 16px;
  background: white;
  border-radius: 4px;
}

.skeleton-table-header {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
}

.skeleton-table-row {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f7fa;
}
</style>
