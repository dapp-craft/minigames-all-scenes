import { engine, executeTask, GltfContainer, Schemas, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { queue, sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { STATIC_MODELS } from './resources'
import { Vector3 } from '@dcl/sdk/math'
import { setupEffects } from '../../common/effects'
import { GameLevel, flaskTransforms } from './game'
import { syncEntity } from '@dcl/sdk/network'
import { Flask } from './game/flask'
import { LEVELS } from './settings/levels'

(globalThis as any).DEBUG_NETWORK_MESSAGES = false

export const State = engine.defineComponent('Lab::state', {
    flasks: Schemas.Array(Schemas.Array(
        Schemas.Color3
    ))
})
  

let playing = false
let interruptPlay: Function
let currentLevel = 1 as keyof typeof LEVELS

let flasks: Flask[] = []
const handlers = {
    start: async () => {
        playing = true
        flasks.map(f => f.destroy())
        flasks = []

        let next: number | null
        let level
        do next = await (level = new GameLevel(
                currentLevel, 
                new Promise((_, r) => interruptPlay = r),
                level => State.getMutable(client).flasks = level.flasks.map(f => f.getConfig())
            ))
                .play()
                .then(() => currentLevel + 1 in LEVELS ? ++currentLevel : null)
                .catch(jump => jump ? currentLevel = jump : null)
                .finally(level.stop.bind(level))
        while (next)
        queue.setNextPlayer()
    },
    exit: () => {
        try {
            interruptPlay()
            playing = false
        } catch (e) {
            console.error(e)
        }
    },
    restart: () => {
        interruptPlay(currentLevel)
    },
    toggleMusic: () => {},
    toggleSfx: () => {}
}

const libraryReady = initMiniGame('e5ec213a-628f-4ef7-8f6f-0cb543da0701', TIME_LEVEL_MOVES, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

executeTask(async () => {
    for (const model of STATIC_MODELS) {
        const entity = engine.addEntity()
        GltfContainer.create(entity, model)
        Transform.create(entity, { parent: sceneParentEntity })
    }
})


export const client = engine.addEntity()
export async function main() {
    State.create(client)
    syncEntity(client, [State.componentId], 45678)
    setupEffects(Vector3.create(0, 2.5, -5))
    const locators = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    for (const [name, value] of locators) {
        if (name.match(/obj_flask_/)) flaskTransforms.push({...value, parent: sceneParentEntity})
    }
    await libraryReady
    
    let locked = false
    State.onChange(client, async ({flasks: state} = {flasks: []}) => {
        console.log("NEW STATE:", state)
        if (playing) return
        if (locked) {console.log("LOCKED"); return}
        locked = true
        if (flasks.length != state.length) {
            await Promise.all(flasks.map(f => f.destroy()))
            flasks = state.map((f, idx) => new Flask(flaskTransforms[idx]))
        }
        await Promise.all(state.map((config, idx) => flasks[idx].applyConfig(config)))
        locked = false
    })
}
