import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { GltfContainer, MeshRenderer, Transform, TransformType, engine, executeTask } from '@dcl/sdk/ecs'
import { exitGame, getReadyToStart, initGame, startLevel, stateVariables } from './game'
import players, { getPlayer } from '@dcl/sdk/players'
import { GAME_ID, SESSION_DURATION } from './config'
import { TIME_LEVEL } from '@dcl-sdk/mini-games/src/ui'
import { initMiniGame } from '../../common/library'
import { readGltfLocators } from '../../common/locators'
import { STATIC_MODELS } from './resources/resources'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'

const handlers = {
  start: getReadyToStart,
  exit: exitGame,
  restart: () => {
    startLevel(stateVariables.level)
  },
  toggleMusic: () => {},
  toggleSfx: () => {}
}

const libraryReady = initMiniGame(
  GAME_ID,
  TIME_LEVEL,
  readGltfLocators(`locators/obj_locators_default.gltf`),
  handlers,
  { textColor: Color4.Black(), fontSize: 3 }
)

executeTask(async () => {
  for (const model of STATIC_MODELS) {
    const entity = engine.addEntity()
    GltfContainer.create(entity, model)
    Transform.create(entity, { parent: sceneParentEntity })
  }
})

export function main() {
  initGame()
}
