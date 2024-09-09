// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { engine, GltfContainer, MeshRenderer, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
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
  spawnInitialEntityPull()

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
  })

  initGame()

  setupUI()

  rocketBoard = new board();
}

const spawnInitialEntityPull = () => {
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
    syncEntity(entity, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId], catInRocketEntityId + i)
  }
  for (let i = 0; i <= counterEntity; i++) {
    const entity = engine.addEntity()
    gameState.counterEntity.push(entity)
    syncEntity(entity, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId], catInRocketEntityId + entityAmount + 10 + i)
  }
}

const generateArray = (length: number) => {
  const array = [];
  const catsInRocket = Math.floor(Math.random() * 9)
  let currentSum = 0 + catsInRocket

  while (array.length < length) {
    let num;
    do {
      num = Math.floor(Math.random() * 19) - 9
    } while (num == 0);

    if (currentSum + num <= 0 || currentSum + num > 9) {
      continue;
    }

    array.push(num);
    currentSum += num;
  }
  for (let i = 1; i <= array.length; i++) {
    randomLvl.wave.set(i, { itemQueue: Math.abs(array[i - 1]), goOut: array[i - 1] > 0 ? false : true })
  }
  randomLvl.initialEntityAmount = catsInRocket
  return array
}