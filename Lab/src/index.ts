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
import { Flask } from './game/flask'
import { LEVELS } from './settings/levels'
import { CreateStateSynchronizer } from './stateSync'
import { FlowController } from './utils'

(globalThis as any).DEBUG_NETWORK_MESSAGES = false


const Synchronizer = CreateStateSynchronizer(
    'Lab',
    {
        flasks: Schemas.Array(Schemas.Array(Schemas.Color3))
    },
    {
        launch: async function() {
            console.log("SyncHandler::launch")
        },
        update: async function ({flasks: state} = {flasks: []}) {
            console.log("SyncHandler::update", state, this.flasks)
            if (this.flasks.length != state.length) {
                await Promise.all(this.flasks.map(f => f.destroy()))
                this.flasks = state.map((f, idx) => new Flask(flaskTransforms[idx]))
                await Promise.all(this.flasks.map(f => f.activate()))
            }
            await Promise.all(state.map((config, idx) => this.flasks[idx].applyConfig(config)))
        },
        flasks: new Array<Flask>,
        terminate: async function() {
            console.log("SyncHandler::terminate")
            await Promise.all(this.flasks.map(f => f.destroy()))
            this.flasks = []
        }
    }
)

let flow: FlowController<number>
let currentLevel = 0 as keyof typeof LEVELS
let synchronizer: InstanceType<typeof Synchronizer>

const handlers = {
    start: async () => {
        console.log("ENTER game loop")
        synchronizer.stop()
        let next = currentLevel
        let level
        do next = await (level = new GameLevel(
                currentLevel = next, 
                flow = new FlowController(),
                level => synchronizer.send({flasks: level.flasks.map(f => f.getConfig())})
            ))
            .play()
            .finally(level.stop.bind(level))
            .then(() => currentLevel + 1 in LEVELS ? currentLevel + 1 : void queue.setNextPlayer())
            .catch(({value}) => value ?? undefined)
        while (next !== undefined)
        console.log("LEAVE game loop")
    },
    exit: () => {
        console.log("EXIT game")
        synchronizer.start()
        flow.break()
    },
    restart: () => {
        console.log("RESTART game")
        flow.goto(currentLevel)
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

export async function main() {
    synchronizer = new Synchronizer()
    setupEffects(Vector3.create(0, 2.5, -5))
    const locators = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    for (const [name, value] of locators) {
        if (name.match(/obj_flask_/)) flaskTransforms.push({...value, parent: sceneParentEntity})
    }
    await libraryReady
    synchronizer.start()
}
