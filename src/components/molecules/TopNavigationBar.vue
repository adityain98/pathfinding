<template>
  <div class="top-navigation-bar">
    <div class="navigation-info">
      <h4>
        Pathfinding Visualizer
      </h4>
    </div>
  </div>
</template>
<script>
// import { defineAsyncComponent } from 'vue'
export default {
  components: {
  },
  data () {
    return {
      selectedAlgorithm: 'Dijkstra',
      algorithms: ['Dijkstra']
    }
  }
}
</script>
<style lang="scss" scoped>
.top-navigation-bar {
  height: 250px;
}

.navigation-info {
  height: 120px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 60px;
  border-bottom: 1px solid #e4e4e7;
}
</style>