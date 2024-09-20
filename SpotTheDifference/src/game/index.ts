import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { DIFFICULTIES, DIFFICULTY, MODEL, SETTINGS } from './settings'
import { SIZE, VARIANT } from './types'
import { GameObject } from './object'
import { randomSample, randomChoice, randomInt } from '../../../common/utils/random'
import { readGltfLocators } from '../../../common/locators'
import { engine, Entity, GltfContainer, GltfContainerLoadingState, LoadingState, Transform, TransformType, VisibilityComponent } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'

const MODEL_LOCATORS = new Map<SIZE, TransformType[]>()
let root: Entity

Promise.all(Object.entries(SETTINGS).flatMap(([model, data]) => 
    [VARIANT.BASE, VARIANT.ALT, ...data.variants].map(variant => new Promise<Entity>(async resolve => {
        const entity = engine.addEntity()
        Transform.create(entity, {scale: Vector3.Zero()})
        GltfContainer.create(entity, {src: `models/${model}_${variant}.gltf`})
        do await new Promise<void>(r => utils.timers.setTimeout(r, 100))
        while (GltfContainerLoadingState.getOrNull(entity)?.currentState !== LoadingState.FINISHED)
        resolve(entity)
    })
))).then(entities => {
    console.log(`Preloaded ${entities.length} models`)
    entities.forEach(entity => engine.removeEntity(entity))
})

export async function init(rootEntity: Entity) {
    root = rootEntity
    return Promise.all(Object.values(SIZE).map(async size => {
        const data = await readGltfLocators(`locators/obj_assets_${size}.gltf`)
        MODEL_LOCATORS.set(size, Array.from(data.values()))
    })).catch(error => {
        console.error('Error loading model locators:', error)
    }).then(() => {
        console.log('All model locators loaded')
    })
}

export function generateLevelObjects(difficulty: { [key in keyof typeof DIFFICULTIES]: number }, total: number) {
    const objects: GameObject[] = []
    const unusedModels = new Set(Object.keys(SETTINGS))
    let setup = Object.entries(difficulty).flatMap(
        ([difficulty, count]) => randomSample(DIFFICULTIES[difficulty as DIFFICULTY], count).map(model => {
            if (!unusedModels.delete(model)) throw new Error(`Invalid configuration: too many '${difficulty}' objects`)
            return [model, difficulty as VARIANT] as const
        })
    )
    if (total > unusedModels.size) throw new Error(`Invalid configuration: too many objects in total`)
    setup.push(...randomSample(unusedModels, Math.max(0, total - setup.length)).map(m => [m as MODEL, VARIANT.ALT] as const))
    let locatorsPool = new Map(
        Array.from(MODEL_LOCATORS, ([key, value]) => [key, randomSample(value, value.length)])
    )
    for (const [model, variation] of setup) {
        const locs = locatorsPool.get(SETTINGS[model].size)!
        objects.push(new GameObject(model, VARIANT.BASE, variation, {
            ...locs.pop()!,
            rotation: Quaternion.fromEulerDegrees(0, randomInt(0, 180), 0),
            parent: root
        }))
    }
    return objects
}
