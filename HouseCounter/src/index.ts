// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { engine, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import { GameData, gameState } from './state'
import { catEntityId, catInRocketEntityId, entityAmount, GAME_ID, mainEntityId, rocketCoords, SESSION_DURATION } from './config'

import { initLibrary, queue, sceneParentEntity, ui } from '@dcl-sdk/mini-games/src'
import { syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { setupUI } from './ui'
import { initGame } from './game/game'

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

export async function main() {
  setupStaticModels()
  spawnInitialEntityPull()
  rocket()

  const width = 2.5
  const height = 2.8
  const scale = 1.2

  new ui.ScoreBoard(
    {
      parent: sceneParentEntity,
      position: Vector3.create(-7.07, 3.02, 3.25),
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
    parent: sceneParentEntity,
    position: Vector3.create(0, 2, 2.53653),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    scale: Vector3.create(1, 1, 1)
  })

  initGame()

  setupUI()

}

const spawnInitialEntityPull = () => {
  for (let i = 0; i <= entityAmount; i++) {
    const entity = engine.addEntity()
    gameState.availableEntity.push(entity)
    syncEntity(entity, [GameData.componentId], catEntityId+i) 
  };
  for (let i = 0; i <= entityAmount; i++) {
    const entity = engine.addEntity()
    gameState.entityInRoket.push(entity)
    syncEntity(entity, [GameData.componentId], catInRocketEntityId + i)
}
}

const rocket = () => {
  gameState.rocketWindow = engine.addEntity()
  Transform.createOrReplace(gameState.rocketWindow,
    {
      position: Vector3.create(...rocketCoords),
      rotation: Quaternion.Zero(),
      scale: Vector3.create(3, 3, 3)
    })
  MeshRenderer.setPlane(gameState.rocketWindow)
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