export const startAlgorithm = async (that, methods) => {
  while (that.looping) {
    if (that.looping && !that.openNodes.length) {
      that.openNodes.push(that.grid[that.startCoordinate[1]][that.startCoordinate[0]])
    }
    const node = that.openNodes[0]
    node.isVisited = true
    that.openNodes.shift()
  
    await methods.checkNode(node, methods.upSideCoordinate(node))
    await methods.checkNode(node, methods.downSideCoordinate(node))
    await methods.checkNode(node, methods.upRightSideCoordinate(node), true)
    await methods.checkNode(node, methods.downLeftSideCoordinate(node), true)
    await methods.checkNode(node, methods.rightSideCoordinate(node))
    await methods.checkNode(node, methods.leftSideCoordinate(node))
    await methods.checkNode(node, methods.downRightSideCoordinate(node), true)
    await methods.checkNode(node, methods.upLeftSideCoordinate(node), true)
  
    if (!that.openNodes.length) {
      that.looping = false
    }
  
    if (that.shortestPathFound) {
      const endNode = that.grid[that.foundedEndNode[1]][that.foundedEndNode[0]]
      endNode.isVisited = true
      methods.visualizePath(endNode)
      that.openNodes = []
    }
  }
}