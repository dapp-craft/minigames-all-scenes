import { engine, GltfContainer, Schemas, Transform, TransformType } from '@dcl/sdk/ecs'
import { progress, queue, sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { STATIC_MODELS } from './resources'
import { setupEffects } from '../../common/effects'
import { playLevel } from './game'
import { Flask } from './game/flask'
import { LEVELS } from './settings/levels'
import { CreateStateSynchronizer } from '../../common/synchronizer'
import { FlowController } from './utils'
import { Ui3D } from './game/ui3D'
import { DIFFICULTY_MAPPING, EFFECTS_POSITION } from './settings/constants'
import { SoundManager } from './game/soundManager'

(globalThis as any).DEBUG_NETWORK_MESSAGES = false

// ERRATA: This component and system are used to track and block entity id reuse,
// because sometimes it causes wierd problems like 'Transform already exists',
// even tho the entity id was obtained literally in previous line of code
const RewrittenID = engine.defineComponent('rewrittenID', {
    isNew: Schemas.Boolean,
    timestamp: Schemas.Number,
    originalID: Schemas.Number
})
const addEntity = engine.addEntity
const STATE_NAMES = ['Unknown', 'UsedEntity', 'Removed', 'Reserved']

function logEntityData(id: Entity) {
    const data = [...engine.componentsIter()].reduce(
        (a, c) => (c.has(id) ? { ...a, [c.componentName]: c.get(id) } : a),
        {}
    )
    console.log(`Entity ${id} (${STATE_NAMES[engine.getEntityState(id)]})`, data)
}

engine.addEntity = () => {
    let id = addEntity()
    if (id > 65535) {
        const trashed = [id]
        while ((id = addEntity()) > 65535) trashed.push(id)
        RewrittenID.create(id, { isNew: true, timestamp: Date.now(), originalID: trashed[0] })
        // console.log(`Trashed ids:`, trashed)
    }
    return id
}

engine.addSystem(() => {
    for (let [entity, { isNew, originalID }] of engine.getEntitiesWith(RewrittenID)) {
        if (!isNew) continue
        // console.error(`NEW REWRITTEN ENTITY, id=${originalID}, corrected=${entity}`)
        // logEntityData(entity)
        RewrittenID.getMutable(entity).isNew = false
    }
}, 0)

const Synchronizer = CreateStateSynchronizer(
    'Lab',
    {
        flasks: Schemas.Array(Schemas.Array(Schemas.Color3))
    },
    {
        flasks: new Array<Flask>,
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
            if (state.length || this.flasks.length) soundManager.playSound('pour', 0, 0.5)
            await Promise.all(state.map((config, idx) => this.flasks[idx].applyConfig(config)))
        },
        terminate: async function() {
            console.log("SyncHandler::terminate")
            await Promise.all(this.flasks.map(f => f.destroy()))
            this.flasks = []
        }
    }
)

let ui3d: Ui3D
let flow: FlowController<number>
let currentLevel = 0 as keyof typeof LEVELS
let synchronizer: InstanceType<typeof Synchronizer>
let soundManager = new SoundManager()
let flaskTransforms = new Array<TransformType>

const gameHandlers = {
    start: async () => {
        console.log("ENTER game loop")
        synchronizer.stop()
        let next = currentLevel
        do next = await playLevel(
                flaskTransforms,
                currentLevel = next, 
                flow = new FlowController(),
                ui3d,
                soundManager,
                flasks => synchronizer.send({flasks: flasks.map(f => f.getConfig())})
            )
            .then(() => currentLevel + 1 in LEVELS ? currentLevel + 1 : void queue.setNextPlayer())
            .catch(r => r instanceof FlowController.InterruptType ? r.value ?? undefined : Promise.reject(console.error(r)))
        while (next !== undefined)
        console.log("LEAVE game loop")
    },
    exit: () => {
        console.log("EXIT game")
        synchronizer.start()
        ui3d.lockButtons()
        flow.break()
    },
    restart: () => {
        console.log("RESTART game")
        flow.goto(currentLevel)
    },
    toggleMusic: () => { soundManager.toggleTheme(!soundManager.themePlaying) },
    toggleSfx: () => { soundManager.toggleSounds(!soundManager.soundsEnabled) }
}

const libraryReady = initMiniGame(
    'e5ec213a-628f-4ef7-8f6f-0cb543da0701',
    TIME_LEVEL_MOVES,
    readGltfLocators(`locators/obj_locators_default.gltf`),
    gameHandlers
)

export async function main() {
    // Create static models
    for (const model of STATIC_MODELS) {
        const entity = engine.addEntity()
        GltfContainer.create(entity, model)
        Transform.create(entity, { parent: sceneParentEntity })
    }

    // Setup UI and synchronization
    synchronizer = new Synchronizer()
    const locators = readGltfLocators(`locators/obj_locators_unique.gltf`)
    ui3d = new Ui3D(locators, val => flow.goto(DIFFICULTY_MAPPING[Number(val) as keyof typeof DIFFICULTY_MAPPING]))
    setupEffects(EFFECTS_POSITION)

    // Get current level from progress
    let [{level} = {level: 0}] = await progress.getProgress('level', progress.SortDirection.DESC, 1) ?? []
    level = Math.min(level + 1, Object.keys(LEVELS).length)
    const [difficulty] = Object.entries(DIFFICULTY_MAPPING).reverse().find(([, l]) => level >= l)!
    currentLevel = DIFFICULTY_MAPPING[Number(difficulty) as keyof typeof DIFFICULTY_MAPPING]

    // Fill flask positions array
    for (const [name, value] of await locators) {
        const [match, index] = name.match(/obj_flask_(\d+)/) ?? []
        if (match) flaskTransforms[Number(index)] = {...value, parent: sceneParentEntity}
    }
    flaskTransforms = flaskTransforms.flat(0)

    // Finalize game setup
    await libraryReady
    synchronizer.start()
}
