<template>
  <div class="top-navigation-bar">
    <menubar :model="items" class="menubar-wrapper">
      <template #start>
        <h4 style="margin-right: 24px">Pathfinding Visualizer</h4>
      </template>
      <template #item="{ item, props, hasSubmenu, root }">
        <component :is="item.tag || 'span'" :to="item.path" :target="item.target" class="flex items-center" v-bind="props.action" aria-hidden="false">
          <span v-if="item.disabled" class="ml-2">{{ item.label }}</span>
          <span v-else class="ml-2">{{ item.label }}</span>
          <i
            v-if="hasSubmenu"
            :class="[
              'pi pi-angle-down',
              { 'pi-angle-down ml-2': root, 'pi-angle-right ml-auto': !root }
            ]"
          ></i>
          <img v-if="item.disabled" src="@/assets/coming-soon.png" style="width: 40px">
        </component>
      </template>
      <template #end>
        <a href="https://github.com/adityain98/pathfinding" target="_blank" style="color: #333">
          <v-icon name="bi-github" style="width: 36px; height: 36px"/>
        </a>
      </template>
    </menubar>

    <div v-if="isMobile" style="width: 100vw; padding: 24px 60px">
      <PMessage severity="warn">We are terribly sorry, the experience on mobile devices isn't quite there yet. We will always improve the app in the future.</PMessage>
    </div>

    <div class="algorithm-info">
      <div class="algorithm-trivia">
        <h4>
          {{ algorithmTrivia.title }}
        </h4>
        <div>
          {{ algorithmTrivia.description }}
        </div>
      </div>
      <div class="pathfinding-rules">
        <h4>
          Pathfinding Rules
          <v-icon
            v-tooltip="'Click for more information'"
            name="bi-info-circle"
            @click="toggleDialogRules"
          />
        </h4>
        <div class="pathfinding-rules-items">
          <div>
            <v-icon name="gi-caveman"/>
            <p>Start Node</p>
          </div>
          <div>
            <v-icon name="gi-deer-head"/>
            <p>End Node</p>
          </div>
          <div>
            <v-icon name="bi-tree-fill"/>
            <p>Weight Node</p>
          </div>
          <div>
            <div class="wall-node"></div>
            <p>Wall Node</p>
          </div>
          <div>
            <div class="visited-node"></div>
            <p>Visited Node</p>
          </div>
          <div>
            <div class="path-node"></div>
            <p>Path Node</p>
          </div>
          <div>
            <div class="open-node"></div>
            <p>Open Node</p>
          </div>
        </div>
      </div>
      <div class="how-to-start">
        <h4>
          How To Play?
          <v-icon
            v-tooltip="'Click for more information'"
            name="bi-info-circle"
            @click="toggleDialogPlay"
          />
        </h4>
        <hr>
        <div>
          <div style="display: flex; align-items: center; gap: 8px">
            <PCheckbox v-model="canSearchDiagonallyComputed" :binary="true"></PCheckbox> Can Move Diagonally
          </div>
          <div style="margin-top: 16px; display: flex; gap: 8px;">
            <PButton label="Start Algorithm" @click="startAlgorithm()"></PButton>
            <PButton label="Reset Grid" severity="danger" @click="initGrid()"></PButton>
          </div>
        </div>
      </div>
    </div>

    <PDialog v-model:visible="isOpenDialogPlay" modal header="How To Play" :style="{ width: '40rem' }">
      <div class="dialog-play-wrapper">
        <div><strong>Creating Wall Node:</strong> <span>Left click or hover while holding left click</span></div>
        <div><strong>Creating Weight Node:</strong> <span>Right click or hover while holding right click</span></div>
        <div><strong>Move Start/End Node:</strong> <span>Hold left click then move the node</span></div>
        <img src="@/assets/pathfinding-tutorial.gif" style="width: 100%">
      </div>
    </PDialog>

    <PDialog v-model:visible="isOpenDialogRules" modal header="Pathfinding Rules" :style="{ width: '25rem' }">
      <div>
        <div>
          Moving Horizontally or Vertically costs <strong>10</strong><br>
          while moving Diagonally costs <strong>15</strong>.
        </div>
        <br>
        <div>
          On the other hand, weighted nodes will be added <strong>100</strong>.
        </div>
      </div>
    </PDialog>
  </div>
</template>
<script>
import Menubar from 'primevue/menubar'
import PDialog from 'primevue/dialog'
import PCheckbox from 'primevue/checkbox'
import PButton from 'primevue/button'
import PMessage from 'primevue/message'
import { isMobile } from 'mobile-device-detect'

export default {
  components: {
    Menubar,
    PDialog,
    PCheckbox,
    PButton,
    PMessage
  },
  props: {
    canSearchDiagonally: Boolean
  },
  data() {
    return {
      isOpenDialogRules: false,
      isOpenDialogPlay: false,
      canSearchDiagonallyData: false,
      isMobile: isMobile
    }
  },
  computed: {
    canSearchDiagonallyComputed: {
      get () {
        return this.canSearchDiagonallyData
      },
      set () {
        this.canSearchDiagonallyData = !this.canSearchDiagonallyData
        this.$emit('toggleDiagonalSearch')
      }
    },
    items () {
      return [
        {
          label: 'Pathfinding Algorithms',
          hasSubmenu: true,
          items: [
            {
              label: `Dijkstra's Algorithm`,
              tag: 'router-link',
              path: '/dijkstra'
            },
            {
              label: 'A* Algorithm',
              tag: 'router-link',
              path: '/a-star'
            }
          ]
        },
        {
          label: 'Maze Algorithms',
          hasSubmenu: true,
          items: [
            {
              label: 'Sidewinder Maze',
              command: this.sidewinderMazeGenerator
            }
          ]
        }
      ]
    },
    algorithmTrivia () {
      if (this.$route.meta.algorithm === 'aStar') {
        return {
          title: 'A* Algorithm',
          description: `A* (A-Star) is an informed search algorithm used for finding the shortest path between nodes in a graph. It's similar to Dijkstra's algorithm but incorporates a heuristic to prioritize nodes, making it faster and more efficient in many cases, especially in pathfinding for games and maps.`
        }
      }

      return {
        title: `Dijkstra's Algorithm`,
        description: `Dijkstra's algorithm is a shortest path algorithm used to find the minimum distance between nodes in a graph. It works for graphs with non-negative edge weights and is commonly used in pathfinding and network routing.`
      }
    }
  },
  mounted () {
    this.canSearchDiagonallyData = this.canSearchDiagonally
  },
  methods: {
    sidewinderMazeGenerator () {
      this.$emit('sidewinderMazeGenerator')
    },
    toggleDialogRules () {
      this.isOpenDialogRules = !this.isOpenDialogRules
    },
    toggleDialogPlay () {
      this.isOpenDialogPlay = !this.isOpenDialogPlay
    },
    startAlgorithm () {
      this.$emit('startAlgorithm')
    },
    initGrid () {
      this.$emit('initGrid')
    }
  }
}
</script>
<style lang="scss" scoped>
.menubar-wrapper {
  height: 80px;
  padding: 24px 60px;
  border-radius: 0;
  border-bottom: 1px solid #e4e4e7;
}
.algorithm-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 48px;
  padding: 24px 60px;

  h4 {
    margin-bottom: 8px;

    .ov-icon {
      cursor: pointer;
    }
  }

  .algorithm-trivia {
    max-width: 430px;

    div {
      font-size: 14px;
    }
  }

  .pathfinding-rules {

    .pathfinding-rules-items {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      flex-direction: column;
      max-height: 110px;
      gap: 16px;

      .ov-icon, .wall-node, .visited-node, .path-node, .open-node {
        width: 24px;
        height: 24px;
      }
  
      div {
        display: flex;
        align-items: center;
        gap: 8px;
      }
  
      .wall-node {
        background-color: #1b263b;
      }

      .visited-node {
        background-color: #219ebc;
      }

      .path-node {
        background-color: #faedcd;
      }

      .open-node {
        background-color: #fcbf49;
      }
    }
  }

  .how-to-play {
    h4 {
      cursor: pointer;
    }
  }
}

.dialog-play-wrapper {
  div {
    margin-bottom: 8px
  }

  img {
    margin-top: 20px
  }
}

@media screen and (max-width: 548px) {
  .pathfinding-rules {
    .pathfinding-rules-items {
      max-height: 150px !important;
    }
  }
}
</style>
