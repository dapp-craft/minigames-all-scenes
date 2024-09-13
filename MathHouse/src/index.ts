// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { AudioSource, engine, GltfContainer, TextShape, Transform, Tween, VisibilityComponent } from '@dcl/sdk/ecs'
import { gameState } from './state'
import { catEntityId, catInRocketEntityId, counterEntity, entityAmount, GAME_ID, soundConfig, startCoords } from './config'

import { syncEntity } from '@dcl/sdk/network'
import { setupStaticModels } from './staticModels/setupStaticModels'
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
  if (soundConfig.volume != 0) {
    soundConfig.volume = 0
    AudioSource.getMutable(mainThereme).volume = 0
  }
  else {
    soundConfig.volume = 0.5
    AudioSource.getMutable(mainThereme).volume = 0.07
  }
}

initMiniGame(GAME_ID, preset, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

export let rocketBoard: any

export async function main() {
  setupStaticModels()
  spawnInitialEntityPoll()

  initGame()
  
  setupUI()

  rocketBoard = new board();
}

const spawnInitialEntityPoll = async () => {
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

  const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)

  TextShape.create(gameState.levelCounter, {
    text: '0',
    fontSize: 3
  })
  Transform.create(gameState.levelCounter, { ...data.get('counter_level'), rotation: Quaternion.create(0, -.42, .175, 0), parent: sceneParentEntity })
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

let i = 1
const playBackgroundMusic = () => {
  ++i
  if(i >= 4) i = 1
  AudioSource.getMutable(mainThereme).audioClipUrl = ost.get(i)!
  console.log(ost.get(i))
}
