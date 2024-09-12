import { engine, Entity, MeshRenderer, TextAlignMode, TextShape, Transform } from '@dcl/sdk/ecs'
// import { gameDataEntity, sessionStartedAt } from '../game'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { sceneParentEntity } from '../globals'
import { SESSION_DURATION } from '../config'
import { gameState, sessionState } from './game'

let movesEntity: Entity
let timeEntity: Entity
let playerNameEntity: Entity

export function initStatusBoard() {
  movesEntity = engine.addEntity()
  timeEntity = engine.addEntity()
  playerNameEntity = engine.addEntity()

  Transform.create(movesEntity, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 4, -6),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })

  Transform.create(timeEntity, {
    parent: sceneParentEntity,
    position: Vector3.create(2, 4, -6),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })

  Transform.create(playerNameEntity, {
    parent: sceneParentEntity,
    position: Vector3.create(-2, 4, -6),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  // MeshRenderer.setBox(playerNameEntity)

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
  if (sessionState.startTime === 0) return

  // console.log('updateTexts')

  const gameElapsedTime = (SESSION_DURATION - (Date.now() - sessionState.startTime)) / 1000
  const minutes = Math.max(Math.floor(gameElapsedTime / 60), 0)
  const seconds = Math.max(Math.round(gameElapsedTime) - minutes * 60, 0)

  TextShape.createOrReplace(playerNameEntity, {
    text: `${sessionState.playerName}`,
    fontSize: 3,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
    textColor: Color4.White(),
  })

  if (gameState.level > 0) {
    TextShape.createOrReplace(timeEntity, {
      text: `${minutes.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      })}:${seconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`,
      fontSize: 3,
      textColor: Color4.Black()
    })
  } else {
    TextShape.createOrReplace(timeEntity, {
      text: '',
      fontSize: 3,
      textColor: Color4.Black()
    })
  }

  TextShape.createOrReplace(movesEntity, {
    text: `${gameState.moves}`,
    fontSize: 3,
    textColor: Color4.Black()
  })
}
