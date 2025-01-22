import { engine, executeTask, GltfContainer, Schemas, Transform, TransformType } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { initGame, mirrors } from './game'
import { CreateStateSynchronizer } from '../../common/synchronizer'
import { Mirror } from './game/Mirror'
;(globalThis as any).DEBUG_NETWORK_MESSAGES = false

let mirrorTransforms: TransformType[] = []

const handlers = {
  start: () => {
    synchronizer.stop()
    syncGameProgress(mirrors)
  },
  exit: () => {},
  restart: () => {},
  toggleMusic: () => {},
  toggleSfx: () => {}
}

export const syncGameProgress = (mirrors: Mirror[]) => {
  synchronizer.send({
    mirrors: mirrors.map((m) => m.mirrorTransform.rotation),
    activeMirror: mirrors.findIndex((m) => m.isActive)
  })
}

const libraryReady = initMiniGame(
  '',
  TIME_LEVEL_MOVES,
  readGltfLocators(`locators/obj_locators_default.gltf`),
  handlers
)

const MODELS: string[] = [
  'models/obj_floor.gltf',
  'models/obj_ground.gltf',
  'models/obj_railings.gltf',
  'models/obj_wall.gltf'
]

executeTask(async () => {
  for (const model of MODELS) {
    const entity = engine.addEntity()
    GltfContainer.create(entity, { src: model })
    Transform.create(entity, { parent: sceneParentEntity })
  }
})

export async function main() {
  await libraryReady
  initGame()
  mirrorTransforms = mirrors.map((m) => m.mirrorTransform)
  synchronizer = new Synchronizer()
  synchronizer.start()
}

let synchronizer: InstanceType<typeof Synchronizer>

const Synchronizer = CreateStateSynchronizer(
  'Laser',
  {
    mirrors: Schemas.Array(Schemas.Quaternion),
    activeMirror: Schemas.Number
  },
  {
    mirrors: new Array<Mirror>(),
    launch: async function () {
      console.log('SyncHandler::launch')
    },
    update: async function ({ mirrors: quaternions, activeMirror } = { mirrors: [], activeMirror: 0 }) {
      console.log('SyncHandler::update', quaternions, this.mirrors)
      if (this.mirrors.length != quaternions.length) {
        this.mirrors = quaternions.map((f, idx) => new Mirror(mirrorTransforms[idx]))
        mirrors.forEach((m) => engine.removeEntity(m.mirrorEntity))
      }
      this.mirrors.forEach((mirror, idx) => {
        mirror.mirrorTransform.rotation = quaternions[idx]
        mirror.isActive = idx === activeMirror
        mirror.createMirror()
        mirror.calculateAllRays(this.mirrors)
      })
    },
    terminate: async function () {
      console.log('SyncHandler::terminate')
    }
  }
)
