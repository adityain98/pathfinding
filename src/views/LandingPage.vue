<template>
  <div>
    <DijkstraAlgorithm></DijkstraAlgorithm>
  </div>
</template>
<script>
import { defineAsyncComponent } from 'vue'

export default {
  components: {
    DijkstraAlgorithm: defineAsyncComponent(
      () => import('@/components/algorithm/DijkstraAlgorithm.vue')
    )
  }
}
</script>
<style lang="scss" scoped></style>
