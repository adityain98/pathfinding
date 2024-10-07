import timer from '@/functions/timer'

const generateBorder = async (grid, gridDimension) => {
  const gridWidth = gridDimension[0] - 1
  const gridHeight = gridDimension[1] - 1

  for (const node of grid[0]) {
    node.isWall = true
    await timer(10)
  }

  for (let i = 0; i < gridHeight; i++) {
    const node = grid[i][gridWidth]
    node.isWall = true
    await timer(10)
  }

  for (let i = gridWidth; i >= 0; i--) {
    const node = grid[gridHeight][i]
    node.isWall = true
    await timer(10)
  }

  for (let i = gridHeight; i >= 0; i--) {
    const node = grid[i][0]
    node.isWall = true
    await timer(10)
  }
}

const sidewinderAlgorithm = async (grid, gridDimension) => {
  let accessedWidth = 1
  let accessedHeight = 2

  const gridWidth = gridDimension[0] - 1
  const gridHeight = gridDimension[1] - 1

  let loopingVertically = true
  let loopingHorizontally = true

  while (loopingVertically) {

    if (accessedHeight + 2 >= gridHeight) {
      loopingVertically = false
    }

    const xGrid = grid[accessedHeight]
    loopingHorizontally = true
    accessedWidth = 1
    while (loopingHorizontally) {
      if (accessedWidth >= gridWidth) {
        loopingHorizontally = false
        break
      }

      let randomWidth = Math.ceil(Math.random() * 6) + 1

      if (accessedWidth + randomWidth > gridWidth ) {
        randomWidth = gridWidth - accessedWidth
      }
      
      for (let i = accessedWidth; i <= accessedWidth + randomWidth; i++) {
        const node = xGrid[i]
        node.isWall = true
  
        await timer(10)
      }

      grid[accessedHeight + 1][accessedWidth + randomWidth].isWall = true

      const randomPath = accessedWidth + Math.floor(Math.random() * (randomWidth - 1))

      if (!grid[accessedHeight - 1][randomPath].isWall) {
        xGrid[randomPath].isWall = false
      } else if (!grid[accessedHeight + 1][randomPath - 1].isWall) {
        xGrid[randomPath - 1].isWall = false
      } else if (!grid[accessedHeight + 1][randomPath + 1].isWall) {
        xGrid[randomPath + 1].isWall = false
      }

      await timer(10)

      accessedWidth += randomWidth + 1
    }


    accessedHeight += 2
  }
}

const setStartEndNode = async (grid, gridDimension) => {
  const gridWidth = gridDimension[0] - 1
  const gridHeight = gridDimension[1] - 1

  // set start and delete around wall
  const startNode = grid[0][0]

  startNode.isWall = false
  startNode.isStartNode = true
  startNode.weight = 0

  grid[0][1].isWall = false
  grid[1][0].isWall = false
  grid[1][1].isWall = false

  const arrEmptyNode = []

  for (let i = gridHeight; i > gridHeight - 2; i--) {
    for(let j = 1; j < gridWidth; j++) {
      const node = grid[i][j]
      if (!node.isWall) {
        arrEmptyNode.push(node)
      }
    }
  }

  const randomIndex = Math.floor(Math.random() * arrEmptyNode.length)

  // set end
  const endNode = arrEmptyNode[randomIndex]
  endNode.isWall = false
  endNode.isEndNode = true

  return {
    startCoordinate: [0, 0],
    endCoordinate: endNode.coordinate
  }
}

export const sidewinderMazeGenerator = async (grid, gridDimension) => {
  for (const xGrid of grid) {
    for (const node of xGrid) {
      node.isStartNode = false
      node.isEndNode = false

      node.isWall = false
      node.isWeightNode = false

      node.isVisited = false
      node.isPath = false

      node.weight = 1000000
      node.parentNode = [0, 0]
    }
  }

  await generateBorder(grid, gridDimension)

  await sidewinderAlgorithm(grid, gridDimension)

  const startEndNodeCoordinate = await setStartEndNode(grid, gridDimension)

  return {
    startCoordinate: startEndNodeCoordinate.startCoordinate,
    endCoordinate: startEndNodeCoordinate.endCoordinate
  }
}