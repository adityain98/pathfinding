<template>
  <div>
    <top-navigation-bar
      :algorithm="algorithm"
      @changeAlgorithm="changeAlgorithm"
      @sidewinderMazeGenerator="sidewinderMazeGenerator"
      @toggleDiagonalSearch="toggleDiagonalSearch"
      @startAlgorithm="startAlgorithm"
      @initGrid="initGrid"
    ></top-navigation-bar>
    <DefaultGrid
      ref="algorithm"
      :algorithm="algorithm"
    ></DefaultGrid>
  </div>
  <PDialog v-model:visible="dialogVisible" modal :closable="false" :showHeader="false" contentStyle="padding: 24px">
    <div style="max-width: 280px; display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 16px;">
      <img src="@/assets/disappointed.png" style="height: 200px">
      <div style="text-align: center;">We are terribly sorry, the experience on mobile devices isn't quite there yet.</div>
      <div style="text-align: center;">You still be able to start pathfinding and generate maze, but certain features are limited.</div>
      <PButton label="Understood" style="width: 100%" @click="dialogVisible = false"></PButton>
    </div>
  </PDialog>
</template>
<script>
import { defineAsyncComponent } from 'vue'
import { isMobile } from 'mobile-device-detect'

import PDialog from 'primevue/dialog';
import PButton from 'primevue/button'

export default {
  components: {
    TopNavigationBar: defineAsyncComponent(() => import('@/components/molecules/TopNavigationBar.vue')),
    DefaultGrid: defineAsyncComponent(() => import('@/components/grid/DefaultGrid.vue')),
    PDialog,
    PButton
  },
  data () {
    return {
      isMounted: false,
      dialogVisible: false,
      isMobile: isMobile,
      algorithm: 'dijkstra'
    }
  },
  computed: {
    canSearchDiagonally () {
      if (!this.isMounted) return false
      return this.$refs.algorithm.canSearchDiagonally
    }
  },
  mounted () {
    this.isMounted = true

    if (this.isMobile) {
      this.dialogVisible = true
    }

  },
  methods: {
    sidewinderMazeGenerator () {
      this.$refs.algorithm.sidewinderMazeGenerator()
    },
    toggleDiagonalSearch () {
      this.$refs.algorithm.toggleDiagonalSearch()
    },
    startAlgorithm () {
      this.$refs.algorithm.startAlgorithm()
    },
    initGrid () {
      this.$refs.algorithm.initGrid()
    },
    changeAlgorithm (e) {
      this.algorithm = e
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
