<template>
  <div>
    <div v-for="(xGrid, yIndex) in grid" :key="yIndex" class="x-grid">
      <div
        v-for="node in xGrid"
        :key="node.coordinate"
        class="node-element"
        :class="[
          {
            'start-node': node.isStartNode,
            'end-node': node.isEndNode,
            'visited-node': node.isVisited,
            'path-node': node.isPath,
            'wall-node': node.isWall,
          }
        ]"
        @click="setWall(node)"
      >
          {{node.weight}}
      </div>
    </div>
    <div>{{filteredOpenNodes}}</div>

    <button @click="startAlgorithm()">start</button>
    <button @click="initGrid()">Reset</button>
  </div>
</template>
<script>
const maxWeight = 1000000
const defaultStartCoordinate = [15, 9]
const defaultEndCoordinate = [15, 14]

export default {
  data () {
    return {
      grid: [],
      gridWitdh: 20,
      gridHeight: 15,
      distanceWeight: 10,
      nodeTemplate: {
        coordinate: [0, 0],
        coordinateX: 0,
        coordinateY: 0,
        weight: maxWeight,
        parentNode: [0, 0],
        isWeightNode: false,
        isStartNode: false,
        isEndNode: false,
        isWall: false,
        isVisited: false,
        isPath: false
      },
      startCoordinate: [15, 9],
      endCoordinate: [15, 14],
      openNodes: [],
      looping: false
    }
  },
  computed: {
    filteredOpenNodes () {
      return this.openNodes.map(node => node.coordinate)
    }
  },
  created () {
    this.initGrid()
  },
  methods: {
    resetGrid () {
      this.looping = false

      this.grid = []
      this.openNodes = []
      this.startCoordinate = defaultStartCoordinate
      this.endCoordinate = defaultEndCoordinate
    },
    setWall (node) {
      node.isWall = !node.isWall
    },
    timer (ms) {
      return new Promise(res => setTimeout(res, ms))
    },
    initGrid () {
      this.resetGrid()

      for (let yCoordinate = 0; yCoordinate < this.gridHeight; yCoordinate++) {
        const yArray = []
        for (let xCoordinate = 0; xCoordinate < this.gridWitdh; xCoordinate++) {
          yArray.push({
            ...JSON.parse(JSON.stringify(this.nodeTemplate)),
            coordinate: [xCoordinate, yCoordinate],
            coordinateX: xCoordinate,
            coordinateY: yCoordinate,
            isStartNode:
              xCoordinate === this.startCoordinate[0] && yCoordinate === this.startCoordinate[1],
            isEndNode:
              xCoordinate === this.endCoordinate[0] && yCoordinate === this.endCoordinate[1],
            weight:
              xCoordinate === this.startCoordinate[0] && yCoordinate === this.startCoordinate[1]
                ? 0
                : maxWeight,
            parentNode:
              xCoordinate === this.startCoordinate[0] && yCoordinate === this.startCoordinate[1]
                ? this.startCoordinate
                : [0, 0]
          })
        }
        this.grid.push(yArray)
      }
      console.log(JSON.parse(JSON.stringify(this.grid)))
    },
    upSideCoordinate (node) {
      return [node.coordinateX, node.coordinateY - 1]
    },
    rightSideCoordinate (node) {
      return [node.coordinateX + 1, node.coordinateY]
    },
    downSideCoordinate (node) {
      return [node.coordinateX, node.coordinateY + 1]
    },
    leftSideCoordinate (node) {
      return [node.coordinateX - 1, node.coordinateY]
    },
    checkNode (coordinate) {
      if (
          coordinate[0] < 0 ||
          coordinate[0] >= this.gridWitdh ||
          coordinate[1] < 0 ||
          coordinate[1] >= this.gridHeight
      ) return false

      const node = this.grid[coordinate[1]][coordinate[0]]

      if (
        node === undefined ||
        node.isWall === true ||
        node.weight !== maxWeight ||
        node.isVisited === true ||
        node.isStartNode === true
      ) return false

      return true
    },
    async pushOpenNodes (parentNode, ...args) {
      for (const node of args ) {
        if (node) {
          node.parentNode = parentNode.coordinate
          node.weight = parentNode.weight + this.distanceWeight
          
          if (node.isEndNode) {
            this.looping = false
            this.visualizePath(node)
            return
          }
          
          node.isVisited = true
          this.openNodes.push(node)
          await this.timer(50)
        }
      }
    },
    async visualizePath (endNode) {
      let pathFound = false
      const shortestPath = []
      let node = endNode

      while (!pathFound) {
        shortestPath.unshift(node)

        if (node.isStartNode) pathFound = true

        node = this.grid[node.parentNode[1]][node.parentNode[0]]
      }

      for (let pathNode of shortestPath) {
        pathNode.isPath = true
        await this.timer(100)
      }
    },
    async startAlgorithm () {
      this.looping = true
      this.openNodes.push(this.grid[this.startCoordinate[1]][this.startCoordinate[0]])

      while (this.looping) {
        const node = this.openNodes[0]
        this.openNodes.shift()

        const upSideCoordinate = this.upSideCoordinate(node)
        const rightSideCoordinate = this.rightSideCoordinate(node)
        const downSideCoordinate = this.downSideCoordinate(node)
        const leftSideCoordinate = this.leftSideCoordinate(node)

        const upSideNode = this.checkNode(upSideCoordinate) ? this.grid[upSideCoordinate[1]][upSideCoordinate[0]] : null
        const rightSideNode = this.checkNode(rightSideCoordinate) ? this.grid[rightSideCoordinate[1]][rightSideCoordinate[0]] : null
        const downSideNode = this.checkNode(downSideCoordinate) ? this.grid[downSideCoordinate[1]][downSideCoordinate[0]] : null
        const leftSideNode = this.checkNode(leftSideCoordinate) ? this.grid[leftSideCoordinate[1]][leftSideCoordinate[0]] : null

        await this.pushOpenNodes(node, upSideNode, rightSideNode, downSideNode, leftSideNode)

        if (!this.openNodes.length) {
          this.looping = false
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.x-grid {
  display: flex;
}

.node-element {
  width: 50px;
  height: 50px;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  transition: 0.5s;

  &.start-node {
    background-color: rebeccapurple;
  }

  &.end-node {
    background-color: red;
  }

  &.visited-node {
    background-color: blue;
  }

  &.path-node {
    background-color: yellow;
  }

  &.wall-node {
    background-color: grey;
  }
}
</style>
