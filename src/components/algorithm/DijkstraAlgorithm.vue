<template>
  <div @mousedown.left="test">
    <div v-for="(xGrid, yIndex) in grid" :key="yIndex" class="x-grid">
      <div
        v-for="node in xGrid"
        :key="node.coordinate"
        class="node-element"
        :class="[
          {
            'start-node': node.isStartNode,
            'end-node': node.isEndNode,
            'weight-node': node.isWeightNode,
            'visited-node': node.isVisited,
            'path-node': node.isPath,
            'wall-node': node.isWall,
          }
        ]"
        @click.left="setModifier(node, 'isWall')"
        @click.right="setModifier(node, 'isWeightNode')"
      >
          {{ node.weight }}
      </div>
    </div>

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
      diagonalDistanceWeight: 15,
      nodeTemplate: {
        coordinate: [0, 0],
        coordinateX: 0,
        coordinateY: 0,
        weight: maxWeight,
        parentNode: [0, 0],
        isStartNode: false,
        isEndNode: false,
        isVisited: false,
        isPath: false,
        // modifier
        isWeightNode: false,
        isWall: false,
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
    resetModifierNode (node, selectedModifier) {
      const modifierKey = ['isWall', 'isWeightNode']

      for (const modifier of modifierKey) {
        if (modifier === selectedModifier) continue

        node[modifier] = false
      }
    },
    setModifier (node, modifier = 'isWall') {
      this.resetModifierNode(node, modifier)

      node[modifier] = !node[modifier]
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
              xCoordinate === this.startCoordinate[0] &&
              yCoordinate === this.startCoordinate[1],
            isEndNode:
              xCoordinate === this.endCoordinate[0] &&
              yCoordinate === this.endCoordinate[1],
            weight:
              xCoordinate === this.startCoordinate[0] &&
              yCoordinate === this.startCoordinate[1]
                ? 0
                : maxWeight,
            parentNode:
              xCoordinate === this.startCoordinate[0] &&
              yCoordinate === this.startCoordinate[1]
                ? this.startCoordinate
                : [0, 0]
          })
        }

        this.grid.push(yArray)
      }
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
    upRightSideCoordinate (node) {
      return [node.coordinateX + 1, node.coordinateY - 1]
    },
    downRightSideCoordinate (node) {
      return [node.coordinateX + 1, node.coordinateY + 1]
    },
    downLeftSideCoordinate (node) {
      return [node.coordinateX - 1, node.coordinateY + 1]
    },
    upLeftSideCoordinate (node) {
      return [node.coordinateX - 1, node.coordinateY - 1]
    },
    checkNodeInsideGrid (coordinate) {
      if (
        coordinate[0] < 0 ||
        coordinate[0] >= this.gridWitdh ||
        coordinate[1] < 0 ||
        coordinate[1] >= this.gridHeight
      ) return false

      return true
    },
    async checkNode (parentNode, coordinate, isDiagonal) {
      if (!this.looping) return

      if (!this.checkNodeInsideGrid(coordinate)) return null

      const node = this.grid[coordinate[1]][coordinate[0]]

      if (
        node === undefined ||
        node.isWall ||
        node.isStartNode === true
      ) return null

      let addedWeight = 0
      addedWeight = parentNode.weight + this.distanceWeight
      if (isDiagonal) {
        addedWeight = parentNode.weight + this.diagonalDistanceWeight
      }

      if (node.isWeightNode) {
        addedWeight += 20
      }

      if (addedWeight >= node.weight) return

      node.parentNode = parentNode.coordinate
      node.weight = addedWeight
      node.isVisited = true
      
      if (node.isEndNode) {
        this.looping = false
        this.visualizePath(node)
        return
      }
      

      this.pushOpenNode(node)
      await this.timer(10)

      return true
    },
    async pushOpenNode (node) {
      this.openNodes.push(node)
    },
    async visualizePath (endNode) {
      let pathFound = false
      const shortestPath = []
      let node = endNode

      while (!pathFound) {
        shortestPath.unshift(node)
        if (node.isStartNode) pathFound = true

        const arrayCoordinate = this.getAllDirectionOfNode(node)
        let nearestNodeCoordinate = null

        for (let coordinate of arrayCoordinate) {
          if (!this.checkNodeInsideGrid(coordinate)) continue

          if (!nearestNodeCoordinate) {
            nearestNodeCoordinate = coordinate
            continue
          }

          if (this.grid[nearestNodeCoordinate[1]][nearestNodeCoordinate[0]].weight > this.grid[coordinate[1]][coordinate[0]].weight) {
            nearestNodeCoordinate = coordinate
          }
        }

        node = this.grid[nearestNodeCoordinate[1]][nearestNodeCoordinate[0]]
      }
      for (let pathNode of shortestPath) {
        pathNode.isPath = true
        await this.timer(100)
      }
    },
    getAllDirectionOfNode (node) {
      // const upSideCoordinate = this.upSideCoordinate(node)
      // const rightSideCoordinate = this.rightSideCoordinate(node)
      // const downSideCoordinate = this.downSideCoordinate(node)
      // const leftSideCoordinate = this.leftSideCoordinate(node)
      // const upRightSideCoordinate = this.upRightSideCoordinate(node)
      // const downRightSideCoordinate = this.downRightSideCoordinate(node)
      // const downLeftSideCoordinate = this.downLeftSideCoordinate(node)
      // const upLeftSideCoordinate = this.upLeftSideCoordinate(node)

      return [this.upSideCoordinate(node), this.rightSideCoordinate(node), this.downSideCoordinate(node), this.leftSideCoordinate(node), this.upRightSideCoordinate(node), this.downRightSideCoordinate(node), this.downLeftSideCoordinate(node), this.upLeftSideCoordinate(node)]
    },
    async startAlgorithm () {
      this.looping = true
      this.openNodes.push(this.grid[this.startCoordinate[1]][this.startCoordinate[0]])

      while (this.looping) {
        const node = this.openNodes[0]
        this.openNodes.shift()

        // const upSideCoordinate = this.upSideCoordinate(node)
        // const rightSideCoordinate = this.rightSideCoordinate(node)
        // const downSideCoordinate = this.downSideCoordinate(node)
        // const leftSideCoordinate = this.leftSideCoordinate(node)

        // const upRightSideCoordinate = this.upRightSideCoordinate(node)
        // const downRightSideCoordinate = this.downRightSideCoordinate(node)
        // const downLeftSideCoordinate = this.downLeftSideCoordinate(node)
        // const upLeftSideCoordinate = this.upLeftSideCoordinate(node)

        await this.checkNode(node, this.upSideCoordinate())
        await this.checkNode(node, this.upRightSideCoordinate(), true)
        await this.checkNode(node, this.rightSideCoordinate())
        await this.checkNode(node, this.downRightSideCoordinate(), true)
        await this.checkNode(node, this.downSideCoordinate())
        await this.checkNode(node, this.downLeftSideCoordinate(), true)
        await this.checkNode(node, this.leftSideCoordinate())
        await this.checkNode(node, this.upLeftSideCoordinate(), true)


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

  &.weight-node {
    background-color: gold;
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
