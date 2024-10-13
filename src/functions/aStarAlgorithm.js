import { startAlgorithm as dijkstraStartAlgorithm } from '@/functions/dijkstraAlgorithm.js'

const assignHeuristicWeight = (that) => {
  that.grid.forEach(xGrid => {
    xGrid.forEach(node => {
      let heuristicDistance = 0
      heuristicDistance += Math.abs(that.endCoordinate[0] - node.coordinate[0])
      heuristicDistance += Math.abs(that.endCoordinate[1] - node.coordinate[1])

      node.hWeight = heuristicDistance * 14
    })
  })
}

export const startAlgorithm = async (that, methods) => {
  // dijkstra and a star have are identical. the only difference is the hCost/hWeight (heuristic)
  await assignHeuristicWeight(that)

  await dijkstraStartAlgorithm(that, methods)
}