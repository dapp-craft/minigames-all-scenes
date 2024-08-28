// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { engine, MeshCollider, MeshRenderer, Transform } from '@dcl/sdk/ecs'

import { changeColorSystem, circularSystem } from './systems'
import { setupUi } from './ui'
import { gameEntityManager } from './entityManager'
import { Cartridge } from './Types'
import { gameState } from './state'
import { entityAmount } from './config'

export async function main() {
  // Defining behavior. See `src/systems.ts` file.
  engine.addSystem(circularSystem)
  engine.addSystem(changeColorSystem)

  // draw UI. Here is the logic to spawn cubes.
  // setupUi()

  const cartridge: Map<number, Cartridge> = new Map([
    [1, { itemQueue: ['test', "test", "test"], goOut: false }],
    [2, { itemQueue: ['test'], goOut: true }],
    [3, { itemQueue: ['test', "test", "test"], goOut: false }]
  ])

  const cartridgeLvl1: Map<number, Cartridge> = new Map([
    [1, { itemQueue: ['test', 'test', 'test'], goOut: false }],
    [2, { itemQueue: ['test', 'test'], goOut: false }],
  ])

  const cartridgeLvl2: Map<number, Cartridge> = new Map([
    [1, { itemQueue: ['test', 'test'], goOut: false }],
    [2, { itemQueue: ['test', 'test', 'test', 'test'], goOut: false }],
    [3, { itemQueue: ['test', 'test', 'test'], goOut: false }],
  ])

  for (let i = 0; i <= entityAmount; i++) gameState.availableEntity.push(engine.addEntity());

  rocket()

  // spawnCubesAtDistance(5, 3)

  const entityManager = new gameEntityManager({ cartridge: cartridge, spawnEntityDelay: { time: 5000, random: true }, initialEntityAmount: 6 })
  await entityManager.startGame()
}

const rocket = () => {
  gameState.rocketWindow = engine.addEntity()
  Transform.createOrReplace(gameState.rocketWindow,
    {
      position: Vector3.create(8, 1.5, 2),
      rotation: Quaternion.Zero(),
      scale: Vector3.create(3, 3, 3)
    })
  MeshRenderer.setPlane(gameState.rocketWindow)
}