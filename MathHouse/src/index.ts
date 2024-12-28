import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { Animator, AudioSource, engine, GltfContainer, TextShape, Transform, Tween, VisibilityComponent } from '@dcl/sdk/ecs'
import { gameState } from './state'
import { catEntityId, catInRocketEntityId, counterEntity, entityAmount, GAME_ID, gameTime, playerHealth, rocketCoords, soundConfig } from './config'
import { parentEntity, syncEntity } from '@dcl/sdk/network'
import { setupStaticModels, setupStaticModelsFromGltf } from './staticModels/setupStaticModels'
import { exitCallback, getReadyToStart, initGame, restartCallback } from './game/game'
import { board } from './board'
import { randomLvl } from './levels'
import { heart, kitty } from './resources/resources'
import { generatedData } from './Types'
import { readGltfLocators } from '../../common/locators'
import { sceneParentEntity } from './globals'
import { initMiniGame } from '../../common/library'
import { mainThereme } from './SoundManager'
import { SCORE } from '@dcl-sdk/mini-games/src/ui'
import { setupEffects } from '../../common/effects'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

const handlers = {
  start: () => getReadyToStart(),
  exit: () => exitCallback(),
  restart: () => restartCallback(),
  toggleMusic: () => playBackgroundMusic(),
  toggleSfx: () => toggleVolume()
}

const toggleVolume = () => {
  if (soundConfig.volume != 0) soundConfig.volume = 0
  else soundConfig.volume = 0.5
}

initMiniGame(GAME_ID, [SCORE], readGltfLocators(`locators/obj_locators_default.gltf`), handlers, { timeouts: gameTime })

export let rocketBoard: any

export async function main() {
  setupEffects(Vector3.create(0, 2.5, -3));

  spawnInitialEntityPoll()

  setupStaticModels()

  await setupStaticModelsFromGltf()

  initGame()

  // init()

  rocketBoard = new board();
}

const spawnInitialEntityPoll = async () => {
  syncEntity(gameState.rocketWindow, [Tween.componentId], 5200)
  syncEntity(gameState.levelCounter, [TextShape.componentId], catInRocketEntityId + entityAmount + counterEntity + 100)
  syncEntity(gameState.healthPoints, [TextShape.componentId], catInRocketEntityId + entityAmount + counterEntity + 101)
  syncEntity(gameState.healthPoints, [TextShape.componentId], catInRocketEntityId + entityAmount + counterEntity + 102)

  for (let i = 0; i <= entityAmount; i++) {
    const entity = engine.addEntity()
    syncEntity(entity, [Transform.componentId, VisibilityComponent.componentId], catEntityId + i)
    if (Transform.getOrNull(entity) != null) return
    GltfContainer.createOrReplace(entity, { src: kitty.src })
    Transform.createOrReplace(entity, { position: Vector3.create(...rocketCoords) })
    VisibilityComponent.createOrReplace(entity, { visible: false })
    gameState.availableEntity.push(entity)
  }
  for (let i = 0; i <= entityAmount; i++) {
    const entity = engine.addEntity()
    syncEntity(entity, [Tween.componentId, GltfContainer.componentId], catInRocketEntityId + i)
    if (Transform.getOrNull(entity) != null) return
    parentEntity(entity, gameState.rocketWindow)
    gameState.entityInRoket.push(entity)
  }
  for (let i = 0; i <= counterEntity; i++) {
    const entity = engine.addEntity()
    syncEntity(entity, [Tween.componentId, GltfContainer.componentId], catInRocketEntityId + entityAmount + 10 + i)
    if (Transform.getOrNull(entity) != null) return
    parentEntity(entity, gameState.rocketWindow)
    gameState.counterEntity.push(entity)
  }
  for (let i = 0; i <= 3; i++) {
    const entity = engine.addEntity()
    gameState.syncModels.push(entity);
    syncEntity(entity, [Animator.componentId], catInRocketEntityId + entityAmount + counterEntity + 50 + i)
  }

  const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
  TextShape.create(gameState.levelCounter, {
    text: 'Level: 1',
    fontSize: 3,
    textAlign: 3
  })
  if (Transform.getOrNull(gameState.levelCounter) != null) return
  Transform.create(gameState.levelCounter, { ...data.get('counter_level'), rotation: Quaternion.create(0, -.414, .175, 0), parent: sceneParentEntity })
  
  TextShape.create(gameState.healthPoints, {
    text: `${playerHealth}`,
    fontSize: 3,
    textAlign: 3
  })
  if (Transform.getOrNull(gameState.healthPoints) != null) return
  Transform.create(gameState.healthPoints, { ...data.get('counter_lives'), parent: sceneParentEntity })

  GltfContainer.create(gameState.heartIcon, heart)
  if (Transform.getOrNull(gameState.heartIcon) != null) return
  Transform.create(gameState.heartIcon, { ...data.get('label_lives'), parent: sceneParentEntity })
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

      let maxNum = Math.min(availableSum - (remainingSlots - 1), 4)
      let num = generateNumber(1, maxNum);
      if (!data.positive) num = -num

      array.push(num)
      currentSum += num;
    }
  } else {
    while (array.length < data.length) {
      let num
      do num = Math.floor(Math.random() * 9) - 4;
      while (num == 0)

      if (currentSum + num <= 0 || currentSum + num > 9) continue;

      array.push(num);
      currentSum += num;
    }
  }

  randomLvl.wave = new Map()
  for (let i = 1; i <= array.length; i++) {
    randomLvl.wave.set(i, { itemQueue: Math.abs(array[i - 1]), goOut: array[i - 1] > 0 ? false : true })
  }
  randomLvl.initialEntityAmount = catsInRocket

  // console.log(`
  //   Random level generated, with: 
  //   answer:                   ${currentSum}
  //   number of waves:          ${data.length}
  //   cats in rocket on start:  ${catsInRocket}
  //   waves: ${array}
  // `);
}

const playBackgroundMusic = () => {
  if (AudioSource.getMutable(mainThereme).volume != 0) AudioSource.getMutable(mainThereme).volume = 0
  else AudioSource.getMutable(mainThereme).volume = 0.07
}
