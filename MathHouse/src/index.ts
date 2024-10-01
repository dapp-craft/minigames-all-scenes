// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { Animator, AudioSource, engine, GltfContainer, TextShape, Transform, Tween, VisibilityComponent } from '@dcl/sdk/ecs'
import { gameState } from './state'
import { catEntityId, catInRocketEntityId, counterEntity, entityAmount, GAME_ID, mainEntityId, rocketCoords, soundConfig, startCoords } from './config'

import { syncEntity } from '@dcl/sdk/network'
import { setupStaticModels, setupStaticModelsFromGltf } from './staticModels/setupStaticModels'
import { setupUI } from './ui'
import { exitCallback, getReadyToStart, initGame, restartCallback } from './game/game'
import { board } from './board'
import { randomLvl } from './levels'
import { kitty, ost } from './resources/resources'
import { generatedData } from './Types'
import { readGltfLocators } from '../../common/locators'
import { sceneParentEntity } from './globals'
import { initMiniGame } from '../../common/library'
import { mainThereme } from './SoundManager'

const BOARD_TRANSFORM = {
  position: { x: 8, y: 2.6636881828308105, z: 1.0992899895 },
  scale: { x: 1, y: 1, z: 1 },
  rotation: Quaternion.fromAngleAxis(180, Vector3.create(0, 1, 0))
};

const preset = {
  placementStart: 0.06,
  nameStart: 0.08,
  timeStart: 0.7,
  levelStart: 0.96,
  nameHeader: 'PLAYER',
  // timeHeader: 'TIME',
  levelHeader: 'LEVEL'
}

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

initMiniGame(GAME_ID, preset, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

export let rocketBoard: any

export async function main() {
  spawnInitialEntityPoll()

  setupStaticModels()

  await setupStaticModelsFromGltf()

  initGame()

  setupUI()

  rocketBoard = new board();
}

const spawnInitialEntityPoll = async () => {

  for (let i = 0; i <= entityAmount; i++) {
    const entity = engine.addEntity()
    GltfContainer.createOrReplace(entity, { src: kitty.src })
    Transform.createOrReplace(entity, {
      position: Vector3.create(...rocketCoords),
    })
    VisibilityComponent.createOrReplace(entity, { visible: false })
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

  for (let i = 0; i <= 3; i++) {
    const entity = engine.addEntity()
    gameState.syncModels.push(entity);
    syncEntity(entity, [Animator.componentId], catInRocketEntityId + entityAmount + counterEntity + 50 + i)
  }

  gameState.rocketWindow = engine.addEntity()
  syncEntity(gameState.rocketWindow, [Transform.componentId, GltfContainer.componentId, Tween.componentId], 5000)

  const boardEntity = engine.addEntity()
  Transform.create(boardEntity, BOARD_TRANSFORM)
  syncEntity(boardEntity, [Transform.componentId], mainEntityId + 1)

  const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)

  TextShape.create(gameState.levelCounter, {
    text: 'Level: 0',
    fontSize: 3
  })
  Transform.create(gameState.levelCounter, { ...data.get('counter_level'), rotation: Quaternion.create(0, -.414, .175, 0), parent: sceneParentEntity })
  syncEntity(gameState.levelCounter, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, TextShape.componentId], catInRocketEntityId + entityAmount + counterEntity + 100)
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

      let maxNum = Math.min(availableSum - (remainingSlots - 1), 6)
      let num = generateNumber(1, maxNum);
      if (!data.positive) num = -num

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

  randomLvl.wave = new Map()
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

const playBackgroundMusic = () => {
  if (AudioSource.getMutable(mainThereme).volume != 0) AudioSource.getMutable(mainThereme).volume = 0
  else AudioSource.getMutable(mainThereme).volume = 0.07
}
