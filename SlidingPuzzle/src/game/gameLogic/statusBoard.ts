import { engine, Entity, TextAlignMode, TextShape, Transform } from '@dcl/sdk/ecs'
import { gameDataEntity } from '../game'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { sceneParentEntity } from '../../globals'
import { GameData } from '../components/definitions'
import { steps, timer, name } from '../../positions'

let movesEntity: Entity
let timeEntity: Entity
let playerNameEntity: Entity

export function initStatusBoard() {
  movesEntity = engine.addEntity()
  timeEntity = engine.addEntity()
  playerNameEntity = engine.addEntity()

  Transform.create(movesEntity, {
    parent: sceneParentEntity,
    position: steps.position,
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })

  Transform.create(timeEntity, {
    parent: sceneParentEntity,
    position: timer.position,
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })

  Transform.create(playerNameEntity, {
    parent: sceneParentEntity,
    position: name.position,
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })

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
  const gameData = GameData.getOrNull(gameDataEntity)

  if (!gameData) return
  if (gameData.levelStartedAt === 0) return

  const gameElapsedTime = ((GameData.get(gameDataEntity).levelFinishedAt || Date.now()) - GameData.get(gameDataEntity).levelStartedAt) / 1000
  const minutes = Math.floor(gameElapsedTime / 60)
  const seconds = Math.round(gameElapsedTime) - minutes * 60

  TextShape.createOrReplace(playerNameEntity, {
    text: `${gameData.playerName}`,
    fontSize: 3,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
    textColor: Color4.White(),
  })

  if (GameData.get(gameDataEntity).level > 0) {
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
    text: `${GameData.get(gameDataEntity).moves}`,
    fontSize: 3,
    textColor: Color4.Black()
  })
}
