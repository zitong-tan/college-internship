<template>
  <div class="skeleton-list">
    <SkeletonCard v-for="i in count" :key="i" :rows="rows" />
  </div>
</template>

<script>
import SkeletonCard from './SkeletonCard.vue';

export default {
  name: 'SkeletonList',
  components: {
    SkeletonCard
  },
  props: {
    count: {
      type: Number,
      default: 3
    },
    rows: {
      type: Number,
      default: 3
    }
  }
};
</script>

<style scoped>
.skeleton-list {
  width: 100%;
}
</style>
