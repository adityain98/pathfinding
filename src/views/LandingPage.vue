<template>
  <div>
    <top-navigation-bar
      @sidewinderMazeGenerator="sidewinderMazeGenerator"
      @toggleDiagonalSearch="toggleDiagonalSearch"
      @startAlgorithm="startAlgorithm"
      @initGrid="initGrid"
    ></top-navigation-bar>
    <DijkstraAlgorithm
      ref="algorithm"
    ></DijkstraAlgorithm>
  </div>
</template>
<script>
import { defineAsyncComponent } from 'vue'

export default {
  components: {
    TopNavigationBar: defineAsyncComponent(() => import('@/components/molecules/TopNavigationBar.vue')),
    DijkstraAlgorithm: defineAsyncComponent(() => import('@/components/algorithm/DijkstraAlgorithm.vue'))
  },
  data () {
    return {
      isMounted: false
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
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
