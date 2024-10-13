<template>
  <div
    @mousedown.left="isLeftMouseDown = true"
    @mouseup.left="isLeftMouseDown = false"
    @mousedown.right="isRightMouseDown = true"
    @mouseup.right="isRightMouseDown = false"
    oncontextmenu="return false;"
  >
    <div id="grid-wrapper" class="grid-wrapper">
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
              'open-node': !node.isVisited && node.weight !== 0 && node.weight < 1000000,
            }
          ]"
          :style="{
            width: nodeDimension + 'px',
            height: nodeDimension + 'px'
          }"
          @mousedown.left="
            mouseDownNode(node);
            setModifier(node, 'isWall')
          "
          @mouseup.left="mouseHoldedNode = null"
          @mousedown.right="setModifier(node, 'isWeightNode')"
          @mouseover="
            isLeftMouseDown === true && setModifier(node, 'isWall');
            isRightMouseDown === true && setModifier(node, 'isWeightNode')
          "
          @mouseenter="
            mouseHoldedNode &&
            setNode(node, mouseHoldedNode, true)
          "
          @mouseleave="
            (
              node.isStartNode ||
              node.isEndNode
            ) &&
            mouseHoldedNode &&
            setNode(node, node.isStartNode ? 'start' : 'end', false)
          "
        >
          <v-icon v-if="node.isStartNode" name="gi-caveman" class="pointer-event-none icon-start-node"/>
          <v-icon v-if="node.isEndNode" name="gi-deer-head" class="pointer-event-none icon-start-node"/>
          <v-icon v-if="node.isWeightNode" name="bi-tree-fill" class="pointer-event-none icon-start-node"/>
          <!-- for debug purposes -->
          <!-- <span v-if="node.weight < 10000" style="font-size: 10px;">
            {{ node.hWeight }}
          </span> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const maxWeight = 1000000
let defaultStartCoordinate = [5, 5]
let defaultEndCoordinate = [20, 5]

import { startAlgorithm as dijkstraStartAlgorithm } from '@/functions/dijkstraAlgorithm.js'
import { startAlgorithm as aStarStartAlgorithm } from '@/functions/aStarAlgorithm.js'

const startAlgorithm = {
  dijkstraStartAlgorithm,
  aStarStartAlgorithm
}

import { sidewinderMazeGenerator } from '@/functions/sidewinderMaze.js'

import timer from '@/functions/timer.js'

export default {
  props: {
    algorithm: {
      type: String,
      default: 'dijkstra'
    }
  },
  data () {
    return {
      grid: [],
      gridWidth: 50,
      gridHeight: 15,
      nodeDimension: 30,
      distanceWeight: 10,
      diagonalDistanceWeight: 15,
      nodeTemplate: {
        coordinate: [0, 0],
        coordinateX: 0,
        coordinateY: 0,
        weight: maxWeight,
        // heuristic weight
        hWeight: 0,
        // g weight
        gWeight: 0,
        parentNode: [0, 0],
        isStartNode: false,
        isEndNode: false,
        isVisited: false,
        isPath: false,
        // modifier
        isWeightNode: false,
        isWall: false,
      },
      startCoordinate: defaultStartCoordinate,
      endCoordinate: defaultEndCoordinate,
      openNodes: [],
      looping: false,
      isLeftMouseDown: false,
      isRightMouseDown: false,
      mouseHoldedNode: null,
      canSearchDiagonally: false,
      shortestPathFound: false,
      foundedEndNode: [0, 0],
      asb: false
    }
  },
  computed: {
    filteredOpenNodes () {
      return this.openNodes.map(node => node.coordinate)
    }
  },
  mounted () {
    const innerHeight = window.innerHeight
    const innerWidth = window.innerWidth
    const navbarHeight = innerWidth > 1340
      ? 260
      : 260

    if (innerWidth <= 767) {
      this.gridWidth = 15
    } else if (innerWidth <= 1024) {
      this.gridWidth = 25
    } else if (innerWidth <= 1340) {
      this.gridWidth = 30
    }

    const gridWrapper = document.getElementById('grid-wrapper')
    const gridWrapperStyle = getComputedStyle(gridWrapper)
    const paddingX = parseFloat(gridWrapperStyle.paddingLeft) + parseFloat(gridWrapperStyle.paddingRight)
    const paddingY = parseFloat(gridWrapperStyle.paddingTop) + parseFloat(gridWrapperStyle.paddingBottom)

    const nodeDimension = Math.floor((gridWrapper.offsetWidth - paddingX)/this.gridWidth)
    const totalGridY = Math.floor((innerHeight - navbarHeight - paddingY)/nodeDimension)

    this.nodeDimension = nodeDimension
    this.gridHeight = totalGridY

    const halfWidth = Math.floor(this.gridWidth/2)
    const halfHeight = Math.floor(this.gridHeight/2)

    defaultEndCoordinate = [halfWidth + 5, halfHeight]
    defaultStartCoordinate= [halfWidth - 5, halfHeight]

    this.initGrid()
  },
  methods: {
    async sidewinderMazeGenerator () {
      const coordinates = await sidewinderMazeGenerator(this.grid, [this.gridWidth, this.gridHeight])
      this.startCoordinate = coordinates.startCoordinate
      this.endCoordinate = coordinates.endCoordinate
    },
    toggleDiagonalSearch () {
      this.canSearchDiagonally = !this.canSearchDiagonally
    },
    resetGrid () {
      this.looping = false

      this.grid = []
      this.openNodes = []
      this.startCoordinate = defaultStartCoordinate
      this.endCoordinate = defaultEndCoordinate
    },
    resetAlgorithm () {
      this.grid.forEach(xGrid => {
        xGrid.forEach(node => {
          node.isVisited = false
          node.isPath = false
          node.weight = maxWeight
          node.hWeight = 0
          node.gWeight = maxWeight

          if (node.isStartNode) this.setNode(node, 'start', true)
          if (node.isEndNode) this.setNode(node, 'end', true)
        })
      })
    },
    setNode (node, variant, value) {
      this.resetModifierNode(node)

      const isStart = variant === 'start'

      const nodeKey = isStart ? 'isStartNode' : 'isEndNode'
      const nodeKeyCoordinate = isStart ? 'startCoordinate' : 'endCoordinate'

      node[nodeKey] = value

      if (value) {
        this[nodeKeyCoordinate] = node.coordinate
      }

      if (isStart) {
        node.weight = value ? 0 : maxWeight
        node.gWeight = value ? 0 : maxWeight
        node.parentNode = value ? this.startCoordinate : [0, 0]
      }
    },
    mouseDownNode (node) {
      if (
        node.isStartNode ||
        node.isEndNode
      ) this.mouseHoldedNode = node.isStartNode ? 'start' : 'end'
    },
    mouseUpNode (node) {
      if (
        node.isStartNode ||
        node.isEndNode
      ) this.mouseHoldedNode = null
    },
    resetModifierNode (node, selectedModifier) {
      const modifierKey = ['isWall', 'isWeightNode']

      for (const modifier of modifierKey) {
        if (modifier === selectedModifier) continue

        node[modifier] = false
      }
    },
    setModifier (node, modifier = 'isWall') {
      if (
        node.isStartNode ||
        node.isEndNode ||
        this.mouseHoldedNode
      ) return

      this.resetModifierNode(node, modifier)

      node[modifier] = !node[modifier]
    },
    initGrid () {
      this.resetGrid()

      for (let yCoordinate = 0; yCoordinate < this.gridHeight; yCoordinate++) {
        const yArray = []
        for (let xCoordinate = 0; xCoordinate < this.gridWidth; xCoordinate++) {
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
        coordinate[0] >= this.gridWidth ||
        coordinate[1] < 0 ||
        coordinate[1] >= this.gridHeight
      ) return false

      return true
    },
    async checkNode (parentNode, coordinate, isDiagonal) {
      if (!this.looping) return

      if (isDiagonal && !this.canSearchDiagonally) return

      if (!this.checkNodeInsideGrid(coordinate)) return null

      const node = this.grid[coordinate[1]][coordinate[0]]

      if (
        node === undefined ||
        node.isWall ||
        node.isStartNode === true
      ) return null

      let addedWeight = 0
      addedWeight = parentNode.gWeight + this.distanceWeight + node.hWeight
      if (isDiagonal) {
        addedWeight = parentNode.gWeight + this.diagonalDistanceWeight + node.hWeight
      }

      if (node.isWeightNode) {
        addedWeight += 100
      }

      if (addedWeight >= node.weight) return

      node.parentNode = parentNode.coordinate
      node.weight = addedWeight
      node.gWeight = addedWeight - node.hWeight
      
      if (node.isEndNode) {
        this.looping = false
        this.shortestPathFound = true
        this.foundedEndNode = node.coordinate
      }
    
      if (!this.shortestPathFound) {
        this.pushOpenNode(node)
      }
      await timer(10)

      return true
    },
    async pushOpenNode (node) {
      for (const [index, openNode] of this.openNodes.entries()) {
        if (openNode.weight > node.weight) {
          this.openNodes.splice(index, 0, node)
          return
        }
      }

      this.openNodes.push(node)
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
        await timer(30)
      }
    },
    getAllDirectionOfNode (node) {
      let arrCoordinate = [
        this.upSideCoordinate(node),
        this.rightSideCoordinate(node),
        this.downSideCoordinate(node),
        this.leftSideCoordinate(node)
      ]
      if (this.canSearchDiagonally) {
        arrCoordinate = [
          ...arrCoordinate,
          this.upRightSideCoordinate(node),
          this.downRightSideCoordinate(node),
          this.downLeftSideCoordinate(node),
          this.upLeftSideCoordinate(node)
        ]
      }
      return arrCoordinate
    },
    async startAlgorithm () {
      this.resetAlgorithm()
      this.looping = true
      this.shortestPathFound = false

      await startAlgorithm[`${this.algorithm}StartAlgorithm`](this, {
        checkNode: this.checkNode,
        upSideCoordinate: this.upSideCoordinate,
        downSideCoordinate: this.downSideCoordinate,
        upRightSideCoordinate: this.upRightSideCoordinate,
        downLeftSideCoordinate: this.downLeftSideCoordinate,
        rightSideCoordinate: this.rightSideCoordinate,
        leftSideCoordinate: this.leftSideCoordinate,
        downRightSideCoordinate: this.downRightSideCoordinate,
        upLeftSideCoordinate: this.upLeftSideCoordinate,
        visualizePath: this.visualizePath
      })
    }
  },
  watch: {
    algorithm () {
      this.looping = false

      this.$nextTick(() => {
        this.resetAlgorithm()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.grid-wrapper {
  padding: 24px;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.x-grid {
  display: flex;
}

.node-element {
  border: 1px solid #415a77;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;

  // prevent double border
  margin-top: -1px;
  margin-left: -1px;

  &.start-node {
    // background-color: rebeccapurple;
  }

  &.end-node {
    // background-color: red;
  }

  &.weight-node {
    // background-color: #5C816C;
  }

  &.visited-node {
    animation: visited-animation linear 0.5s;
    background-color: #219ebc;
  }

  &.path-node {
    background-color: #faedcd;
  }

  &.open-node {
    background-color: #fcbf49;
  }

  &.wall-node {
    background-color: #1b263b;
    transition: 0.5s;
  }

  .icon-start-node {
    width: 80%;
    height: 80%;
  }

  .icon-wall-node {
    width: 100%;
    height: 100%;
  }
}

@-webkit-keyframes visited-animation { 
  0% { background-color: #fcbf49; }
  40% { background-color: #8ecae6; }
  100% { background-color: #219ebc; } 

} 
@keyframes visited-animation { 
  0% { background-color: #fcbf49; }
  40% { background-color: #8ecae6; }
  100% { background-color: #219ebc; } 
}
</style>
