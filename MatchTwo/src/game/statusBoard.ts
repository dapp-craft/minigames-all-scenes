import { engine, Entity, MeshRenderer, TextAlignMode, TextShape, Transform } from '@dcl/sdk/ecs'
// import { gameDataEntity, sessionStartedAt } from '../game'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { sceneParentEntity } from '../globals'
import { SESSION_DURATION } from '../config'
import { gameState, sessionState } from './game'
import { statusBoardPositions } from './locators/statusBoardPositions'

let movesEntity: Entity
let timeEntity: Entity
let playerNameEntity: Entity

export function initStatusBoard() {
  movesEntity = engine.addEntity()
  timeEntity = engine.addEntity()
  playerNameEntity = engine.addEntity()

  Transform.create(movesEntity, statusBoardPositions.counter_moves)

  let elapsedTime = 0
  const gameLoopPeriod = 0.3

  engine.addSystem((dt: number) => {
    elapsedTime += dt

    if (elapsedTime >= gameLoopPeriod) {
      elapsedTime = 0
      updateTexts()
    }
  })
}

function updateTexts() {
  TextShape.createOrReplace(movesEntity, {
    text: `${gameState.moves}`,
    fontSize: 3,
    textColor: Color4.White()
  })
}
