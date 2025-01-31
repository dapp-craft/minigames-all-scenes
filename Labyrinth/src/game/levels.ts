// 1 - wall
// 0 - empty
// 2 - start
// 3 - finish

import { Position } from "../BoardEngine/Types"
import { CustomCellTypes } from "./types"
import { readFile } from '~system/Runtime'

type Level = {
    board: CustomCellTypes[][],
    start: Position,
    finish: Position
}

export async function loadLevel(level: number): Promise<Level> {

    // TODO: read level from file

    const file = await readFile({ fileName: `levels/1.txt` })
    const levelDataString = Utf8ArrayToStr(file.content)

    const rows = levelDataString.trim().split('\n')
    const height = rows.length
    const width = rows[0].length
    
    const board: CustomCellTypes[][] = Array(height).fill(null).map(() => Array(width).fill("Empty"))
    
    let start: Position | null = null
    let finish: Position | null = null
    
    for (let y = 0; y < height; y++) {
        const row = rows[y]
        for (let x = 0; x < width; x++) {
            const cell = row[x]
            switch (cell) {
                case '0':
                    board[y][x] = 'Empty'
                    break
                case '1':
                    board[y][x] = 'Wall'
                    break
                case '2':
                    board[y][x] = 'Start' 
                    start = {x, y}
                    break
                case '3':
                    board[y][x] = 'Finish'
                    finish = {x, y}
                    break
                default:
                    throw new Error(`Invalid cell type: ${cell} at position ${x}, ${y}`)
            }
        }
    }
    

    if (!start || !finish) {
        throw new Error("Start or finish position not found")
    }

    return {
        board,
        start,
        finish
    }
}


function Utf8ArrayToStr(array: Uint8Array) {
    let out, i, c
    
    out = ''
    i = 0
    while (i < array.length) switch ((c = array[i++]) >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c)
            break
        case 12:
        case 13:
            // 110x xxxx   10xx xxxx
            out += String.fromCharCode(((c & 0x1f) << 6) | (array[i++] & 0x3f))
            break
        case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            out += String.fromCharCode(((c & 0x0f) << 12) | ((array[i++] & 0x3f) << 6) | ((array[i++] & 0x3f) << 0))
            break
    }
    
    return out
}