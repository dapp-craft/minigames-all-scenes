// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { engine, MeshCollider, MeshRenderer, Transform } from '@dcl/sdk/ecs'

import { changeColorSystem, circularSystem } from './systems'
import { setupUi } from './ui'
import { gameEntityManager } from './entityManager'
import { Cartridge, CartridgeTest } from './Types'
import { gameState } from './state'
import { entityAmount, GAME_ID, rocketCoords, SESSION_DURATION } from './config'

import { initLibrary } from '@dcl-sdk/mini-games/src'
import { syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'
import { setupStaticModels } from './staticModels/setupStaticModels'

// initLibrary(engine, syncEntity, players, {
//   environment: 'dev',
//   gameId: GAME_ID,
//   gameTimeoutMs: SESSION_DURATION,
//   gameArea: {
//     topLeft: Vector3.create(1, 0, 0),
//     bottomRight: Vector3.create(15, 5, 9),
//     exitSpawnPoint: Vector3.create(8, 1, 13)
//   }
// })

export async function main() {
  setupStaticModels()
  // Defining behavior. See `src/systems.ts` file.
  engine.addSystem(circularSystem)
  engine.addSystem(changeColorSystem)

  // draw UI. Here is the logic to spawn cubes.
  // setupUi()

  const cartridge: Map<number, CartridgeTest> = new Map([
    [1, { itemQueue: 3, goOut: false }],
    [2, { itemQueue: 1, goOut: true }],
    [3, { itemQueue: 3, goOut: false }]
  ])

  const cartridgeTest: Map<number, CartridgeTest> = new Map([
    [1, { itemQueue: 3, goOut: false }],
    [2, { itemQueue: 1, goOut: true }],
    [3, { itemQueue: 3, goOut: false }]
  ])

  const cartridgeLvl1: Map<number, CartridgeTest> = new Map([
    [1, { itemQueue: 3, goOut: false }],
    [2, { itemQueue: 2, goOut: false }],
  ])

  const cartridgeLvl2: Map<number, CartridgeTest> = new Map([
    [1, { itemQueue: 2, goOut: false }],
    [2, { itemQueue: 4, goOut: false }],
    [3, { itemQueue: 3, goOut: false }],
  ])

  for (let i = 0; i <= entityAmount; i++) gameState.availableEntity.push(engine.addEntity());

  rocket()

  const entityManager = new gameEntityManager({ cartridge: generateCartrige(), spawnEntityDelay: { time: 5000, random: true }, initialEntityAmount: 6 })
  await entityManager.startGame()
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