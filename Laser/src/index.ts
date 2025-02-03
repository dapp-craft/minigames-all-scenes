import { engine, executeTask, GltfContainer, InputAction, pointerEventsSystem, Schemas, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { CreateStateSynchronizer } from '../../common/synchronizer'
import { Mirror } from './game/Mirror'
import { GameFlowManager, SyncGameFlowManager } from './game/GameFlowManager'
import { Vector3 } from '@dcl/sdk/math'
import { laserTransform, mirrorTransforms } from './resources'
;(globalThis as any).DEBUG_NETWORK_MESSAGES = false

export async function main() {
  await libraryReady
  synchronizer = new Synchronizer()
  synchronizer.start()
}

function initGame() {
  gameManager = new GameFlowManager({ laserTransform, mirrorTransforms })
  gameManager.mirrors.forEach((m) => addPointerEvent(m))
  gameManager.randomizeMirrorsRot()
}

executeTask(async () => {
  const MODELS: string[] = [
    'models/obj_floor.gltf',
    'models/obj_ground.gltf',
    'models/obj_railings.gltf',
    'models/obj_wall.gltf',
    'models/obj_terminal.gltf',
    'models/obj_light.gltf',
    'models/obj_gamezone.gltf',
    'models/obj_bench.gltf'
  ]

  for (const model of MODELS) {
    const entity = engine.addEntity()
    GltfContainer.create(entity, { src: model })
    Transform.create(entity, { parent: sceneParentEntity })
  }
})

let synchronizer: InstanceType<typeof Synchronizer>
let gameManager: InstanceType<typeof GameFlowManager>

export interface LightSource {
  getRay(): { origin: Vector3; direction: Vector3 }
}

const handlers = {
  start: () => {
    initGame()
    synchronizer.stop()
    gameManager.startGame()
    syncGameProgress(gameManager.mirrors)
  },
  exit: () => {
    gameManager.endGame()
    syncGameProgress([])
    synchronizer.start()
  },
  restart: () => {
    gameManager.recreateLevel()
    gameManager.mirrors.forEach((m) => addPointerEvent(m))
    syncGameProgress(gameManager.mirrors)
  },
  toggleMusic: () => {},
  toggleSfx: () => {}
}

const libraryReady = initMiniGame(
  '',
  TIME_LEVEL_MOVES,
  readGltfLocators(`locators/obj_locators_default.gltf`),
  handlers
)

const syncGameProgress = (mirrors: Mirror[]) => {
  synchronizer.send({
    mirrors: mirrors.map((m) => m.mirrorTransform.rotation)
  })
}

function addPointerEvent(mirror: Mirror) {
  pointerEventsSystem.onPointerDown(
    {
      entity: mirror.mirrorEntity,
      opts: { button: InputAction.IA_POINTER, hoverText: 'Interact' }
    },
    () => {
      mirror.rotateMirror()
      gameManager.mirrors.forEach((m) => m.darken())
      gameManager.castRay(gameManager.laser)
      syncGameProgress(gameManager.mirrors)
    }
  )
}

const Synchronizer = CreateStateSynchronizer(
  'Laser',
  {
    mirrors: Schemas.Array(Schemas.Quaternion)
  },
  {
    manager: null as SyncGameFlowManager | null,
    launch: async function () {
      console.log('SyncHandler::launch')
    },
    update: async function ({ mirrors: quaternions } = { mirrors: [] }) {
      console.log('SyncHandler::update', quaternions)

      if (gameManager && quaternions.length && !this.manager) gameManager.endGame()

      if (quaternions.length && !this.manager) {
        this.manager = new SyncGameFlowManager({ laserTransform, mirrorTransforms })
      }

      if (this.manager?.mirrors && this.manager.laser) {
        this.manager.mirrors.forEach((m, idx) => {
          m.darken()
          m.mirrorTransform.rotation = quaternions[idx]
          m.createMirror()
        })
        this.manager.castRay(this.manager.laser)
      }

      if (this.manager && !quaternions.length) {
        this.manager.endGame()
        this.manager = null
      }
    },
    terminate: async function () {
      console.log('SyncHandler::terminate')
      this.manager?.endGame()
      this.manager = null
    }
  }
)
