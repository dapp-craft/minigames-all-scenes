


export function shuffleMatrix(matrix: number[][], shuffleCount: number){
    for (let i = 0; i < shuffleCount; i++) {
        swapRandomTiles(matrix)
    }
    while (!isSolvable(matrix)) {
        swapRandomTiles(matrix)
    }
    console.log(
        "Shuffled matrix:  ", matrix
    )
    return matrix
}

function swapRandomTiles(matrix: number[][]) {
    const size = matrix.length
    const row1 = Math.floor(Math.random() * size)
    const column1 = Math.floor(Math.random() * size)
    const row2 = Math.floor(Math.random() * size)
    const column2 = Math.floor(Math.random() * size)
    const temp = matrix[row1][column1]
    matrix[row1][column1] = matrix[row2][column2]
    matrix[row2][column2] = temp
}

function isSolvable(matrix: number[][]): boolean {
    let inversionCount = 0
    const size = matrix.length
    const flattenMatrix = matrix.flat()
    for (let i = 0; i < size * size - 1; i++) {
        if (flattenMatrix[i] === -1) continue
        for (let j = i + 1; j < size * size; j++) {
            if (flattenMatrix[j] === -1) continue
            if (flattenMatrix[i] < flattenMatrix[j]) {
                inversionCount++
            }
        }
    }
    console.log("Inversion count:", inversionCount)
    if (size % 2 === 1) {
        return inversionCount % 2 == 0
    } else {
        const emptyTileRow = matrix.findIndex((row) => row.includes(-1))
        return (inversionCount + emptyTileRow) % 2 == 1
    }
}