import { TransformType } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { readFile } from '~system/Runtime'
 
export async function readGltfLocators(fileName: string) {
    const file = await readFile({ fileName })
    
    const data = JSON.parse(Utf8ArrayToStr(file.content))
    const nodes: ILocatorNode[] = data.nodes ?? []
    const result = new Map<String, TransformType>()
    
    for (const node of nodes) {
        // Unpacking data and applying defaults
        const {
            translation: [tx, ty, tz] = Object.values(Vector3.Zero()),
            rotation: [rx, ry, rz, rw] = Object.values(Quaternion.Identity()),
            scale: [sx, sy, sz] = Object.values(Vector3.One())
        } = node
        // Packing data and converting coordinates
        result.set(node.name, {
            position: {x: -tx, y:  ty, z:  tz},
            rotation: {x:  rx, y: -ry, z: -rz, w: rw},
            scale:    {x:  sx, y:  sy, z:  sz}
        })
    }
    return result
}

interface ILocatorNode {
    name: string
    translation?: [number, number, number]
    scale?: [number, number, number]
    rotation?: [number, number, number, number]
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
    