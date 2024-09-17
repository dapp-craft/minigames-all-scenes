import * as process from 'process';
import * as fs from 'node:fs/promises'
import * as path from 'path';

const FILE_PATH = path.join(process.cwd(), 'scene.json')

async function patchSceneConfig(key, value) {
    const jsonData = JSON.parse(await fs.readFile(FILE_PATH, 'utf8'))
    jsonData[key] = value
    await fs.writeFile(FILE_PATH, JSON.stringify(jsonData, null, 2))
    return jsonData
}

const [, , target, value] = process.argv
let result
if (target === 'worlds' && value) {
    result = patchSceneConfig('worldConfiguration', { name: value })
} else if (target === 'genesis' && value) {
    try {
        const parcels = JSON.parse(value)
        if (!Array.isArray(parcels) || parcels.length === 0) throw new Error('coordinates must be an array')
        result = patchSceneConfig('scene', { parcels, base: parcels[0] })
    } catch (err) {
        result = Promise.reject(`Invalid coordinates: ${err}`)
    }
} else {
    console.log('Usage: node set_deploy_target.mjs {worlds|genesis} {value}')
    process.exit(1)
}
result.then(console.log).catch(err => console.error(`Failed to patch ${FILE_PATH}:\n\t${err}`))
