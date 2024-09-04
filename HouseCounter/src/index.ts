// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { engine, GltfContainer, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { gameState, rocketCoords } from './state'
import { catEntityId, catInRocketEntityId, entityAmount, GAME_ID, SESSION_DURATION } from './config'

import { initLibrary, queue, ui } from '@dcl-sdk/mini-games/src'
import { parentEntity, syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { setupUI } from './ui'
import { initGame } from './game/game'
import { board } from './board'

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

  rocketBoard = new board(rocketCoords);
}



const spawnInitialEntityPull = () => {
  for (let i = 0; i <= entityAmount; i++) {
    const entity = engine.addEntity()
    gameState.availableEntity.push(entity)
    syncEntity(entity, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId], catEntityId + i)
  };
  for (let i = 0; i <= entityAmount; i++) {
    const entity = engine.addEntity()
    gameState.entityInRoket.push(entity)
    syncEntity(entity, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId], catInRocketEntityId + i)
  }
}

function generateRandomNumberAndIterations() {
  const targetNumber = Math.floor(Math.random() * 30) + 1;

  let currentSum = 0;
  const iterations = [];

  while (currentSum < targetNumber) {
    const maxIteration = targetNumber - currentSum

    let iteration = Math.floor(Math.random() * (Math.min(maxIteration, 10) + Math.min(currentSum, 5) + 1)) - Math.min(currentSum, 5);

    if (iteration == 0) iteration++
    iterations.push(iteration);
    currentSum += iteration
  }
  return { targetNumber, iterations };
}

const generateCartrige = () => {
  let generatedData = generateRandomNumberAndIterations()
  let i = 1
  generatedData.iterations.forEach((data => {
    gameState.generatedCartrige.set(i, { itemQueue: Math.abs(data), goOut: data < 0 ? true : false })
    i++
  }))
  gameState.generatedCartrige.forEach((data: any, key: number) => console.log(key, data))
  console.log(generatedData.targetNumber);
  return gameState.generatedCartrige;
}