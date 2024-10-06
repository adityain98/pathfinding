<template>
  <div>
    <top-navigation-bar id="navbar"></top-navigation-bar>
    <DijkstraAlgorithm></DijkstraAlgorithm>
  </div>
</template>
<script>
import { defineAsyncComponent } from 'vue'

export default {
  components: {
    TopNavigationBar: defineAsyncComponent(() => import('@/components/molecules/TopNavigationBar.vue')),
    DijkstraAlgorithm: defineAsyncComponent(() => import('@/components/algorithm/DijkstraAlgorithm.vue'))
  }
}
</script>
<style lang="scss" scoped>
#navbar {
  height: 250px;
}
</style>
