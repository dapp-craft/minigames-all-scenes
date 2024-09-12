// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { engine, GltfContainer, MeshRenderer, TextShape, Transform, Tween, TweenLoop, TweenStateStatus, VisibilityComponent } from '@dcl/sdk/ecs'
import { gameState, rocketCoords } from './state'
import { catEntityId, catInRocketEntityId, counterEntity, entityAmount, GAME_ID, SESSION_DURATION, startCoords } from './config'

import { initLibrary, queue, ui } from '@dcl-sdk/mini-games/src'
import { parentEntity, syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { setupUI } from './ui'
import { initGame } from './game/game'
import { board } from './board'
import { randomLvl } from './levels'
import { kitty } from './resources/resources'
import { generatedData } from './Types'

initLibrary(engine, syncEntity, players, {
  environment: 'dev',
  gameId: GAME_ID,
  gameTimeoutMs: SESSION_DURATION,
  gameArea: {
    topLeft: Vector3.create(1, 0, 0),
    bottomRight: Vector3.create(15, 5, 9),
    exitSpawnPoint: Vector3.create(8, 1, 13)
  }
})

export let rocketBoard: any

export async function main() {
  setupStaticModels()
  spawnInitialEntityPoll()

  const width = 2.5
  const height = 2.8
  const scale = 1.2

  new ui.ScoreBoard(
    {
      position: Vector3.create(1.07, 2.5, 11.1),
      rotation: Quaternion.fromEulerDegrees(0, -90, 0),
      scale: Vector3.create(0.875, 0.78, 1)
    },
    width,
    height,
    scale,
    {
      placementStart: 0.06,
      nameStart: 0.08,
      timeStart: 0.7,
      levelStart: 0.96,
      nameHeader: 'PLAYER',
      timeHeader: 'TIME',
      levelHeader: 'LEVEL'
    }
  )

  queue.initQueueDisplay({
    position: Vector3.create(8, 2, 10.53653),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    scale: Vector3.create(1, 1, 1)
  });

  initGame()

  setupUI()

  rocketBoard = new board();
}

const spawnInitialEntityPoll = () => {
  for (let i = 0; i <= entityAmount; i++) {
    const entity = engine.addEntity()
    GltfContainer.createOrReplace(entity, { src: kitty.src })
    Transform.createOrReplace(entity, {
      position: Vector3.create(...startCoords),
    })
    gameState.availableEntity.push(entity)
    syncEntity(entity, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId], catEntityId + i)
  };
  for (let i = 0; i <= entityAmount; i++) {
    const entity = engine.addEntity()
    gameState.entityInRoket.push(entity)
    syncEntity(entity, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], catInRocketEntityId + i)
  }
  for (let i = 0; i <= counterEntity; i++) {
    const entity = engine.addEntity()
    gameState.counterEntity.push(entity)
    syncEntity(entity, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], catInRocketEntityId + entityAmount + 10 + i)
  }

  TextShape.create(gameState.levelCounter, {
    text: '0',
  })
  Transform.create(gameState.levelCounter, {
    position: Vector3.create(4, 2, 2),
    rotation: Quaternion.create(0, 100, 0.5, 0)
  })
  syncEntity(gameState.levelCounter, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, TextShape.componentId], 4010)
}

export const generateArray = (data: generatedData) => {
  let array = [];
  let catsInRocket = data.initialNumber != null ? data.initialNumber : Math.floor(Math.random() * 9) + 1
  let currentSum = 0 + catsInRocket

  const generateNumber = (min: number, max: number) => { return Math.floor(Math.random() * (max - min + 1)) + min }

  if (data.positive != null) {

    while (array.length < data.length) {
      let availableSum = data.positive ? 9 - currentSum : currentSum - 1
      let remainingSlots = data.length - array.length

      if (availableSum < remainingSlots) {
        array = []
        currentSum = data.initialNumber != null ? data.initialNumber : Math.floor(Math.random() * 9) + 1
        continue
      }

      let num: number;
      if (array.length === data.length - 1) num = data.positive ? availableSum : -availableSum
      else {
        let maxNum = Math.min(availableSum - (remainingSlots - 1), 6)
        num = generateNumber(1, maxNum)
        if (!data.positive) num = -num
      }

      array.push(num)
      currentSum += num;
    }
  } else {
    while (array.length < data.length) {
      let num
      do num = Math.floor(Math.random() * 13) - 6;
      while (num == 0)

      if (currentSum + num <= 0 || currentSum + num > 9) continue;

      array.push(num);
      currentSum += num;
    }
  }
  
  for (let i = 1; i <= array.length; i++) {
    randomLvl.wave.set(i, { itemQueue: Math.abs(array[i - 1]), goOut: array[i - 1] > 0 ? false : true })
  }
  randomLvl.initialEntityAmount = catsInRocket

  console.log(`
    Random level generated, with: 
    answer:                   ${currentSum}
    number of waves:          ${data.length}
    cats in rocket on start:  ${catsInRocket}
    waves: ${array}
  `);
}
