import { AudioSource, ColliderLayer, engine, GltfContainer, pointerEventsSystem, TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { exitCallback, getReadyToStart, initGame } from './game/game'
import { GAME_ID, soundConfig, TOADS_SYNC_ID, toadsGameConfig } from './config'
import { sceneParentEntity, toadsGameState } from './state'
import { GameLogic } from './game/gameLogic'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { frog01, hammer } from './resources/resources'
import { parentEntity, syncEntity } from '@dcl/sdk/network'
import { Vector3 } from '@dcl/sdk/math'
import { mainThereme } from './game/soundManager'
import { SCORE } from '@dcl-sdk/mini-games/src/ui'
import { setupEffects } from '../../common/effects'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

const handlers = {
    start: () => getReadyToStart(),
    exit: () => exitCallback(),
    restart: () => getReadyToStart(),
    toggleMusic: () => playBackgroundMusic(),
    toggleSfx: () => toggleVolume()
}

const libraryReady = initMiniGame(GAME_ID, [SCORE], readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

export const gameLogic = new GameLogic()

export async function main() {
    setupEffects(Vector3.create(0, 2.5, -3));
    setupStaticModels()
    await generateInitialEntity()
    initGame()
    await libraryReady

}

const generateInitialEntity = async () => {
    for (let i = 0; i <= toadsGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        toadsGameState.availableEntity.push(entity)
    }

    const hammerParent = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 1]
    const hammerEntity = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 2]
    const hits = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 4]
    const miss = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 5]
    const counter = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 6]
    const cameraTrigger = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 7]

    syncEntity(hammerParent, [Transform.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 10 + 6)
    syncEntity(hammerEntity, [Transform.componentId, VisibilityComponent.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 10 + 1)
    syncEntity(hits, [Transform.componentId, TextShape.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 10 + 3)
    syncEntity(miss, [Transform.componentId, TextShape.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 10 + 4)
    syncEntity(counter, [Transform.componentId, TextShape.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 10 + 5)
    for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) syncEntity(toadsGameState.availableEntity[i], [Transform.componentId, GltfContainer.componentId], TOADS_SYNC_ID + i)

    toadsGameState.locatorsData = await readGltfLocators(`locators/obj_locators_unique.gltf`)

    toadsGameState.listOfEntity.set('hammerParent', hammerParent)
    toadsGameState.listOfEntity.set('hammer', hammerEntity)
    toadsGameState.listOfEntity.set('hits', hits);
    toadsGameState.listOfEntity.set('miss', miss);
    toadsGameState.listOfEntity.set('counter', counter);
    toadsGameState.listOfEntity.set('cameraTrigger', cameraTrigger);

    toadsGameState.toadInitialHeight = toadsGameState.locatorsData.get(`obj_frog_hidden_1`)!.position.y
    toadsGameState.toadFinishHeight = toadsGameState.locatorsData.get(`obj_frog_shown_1`)!.position.y

    console.log('hammerParent: Loading')
    if (!Transform.has(hammerParent)) {
        Transform.createOrReplace(hammerParent, { position: Vector3.create(8, 2, 2) })
        console.log('hammerParent: Give Transform to entity: ', hammerParent)
    }
    console.log('hammerEntity: Loading')
    if (!Transform.has(hammerEntity)) {
        Transform.createOrReplace(hammerEntity, { parent: hammerParent });
        console.log('hammerEntity: Give Transform to entity: ', hammerEntity)
    }
    if (!VisibilityComponent.has(hammerEntity)) {
        VisibilityComponent.create(hammerEntity, { visible: false });
        console.log('hammerEntity: Give VisibilityComponent to entity: ', hammerEntity)
    }

    GltfContainer.createOrReplace(hammerEntity, hammer)
    parentEntity(hammerEntity, hammerParent)

    console.log('hits: Loading')
    if (!Transform.has(hits) ) {
        Transform.create(hits, { ...toadsGameState.locatorsData.get('counter_hits'), parent: sceneParentEntity })
        console.log('hits: Give Transform to entity: ', hits)
    }
    if (!TextShape.has(hits)) {
        TextShape.create(hits, { text: 'Hits \n0', fontSize: 2 })
        console.log('hits: Give TextShape to entity: ', hits)
    }
    console.log('miss: Loading')
    if (!Transform.has(miss) || !TextShape.has(hits)) {
        Transform.create(miss, { ...toadsGameState.locatorsData.get('counter_misses'), parent: sceneParentEntity })
        console.log('miss: Give Transform to entity: ', miss)
    }
    if (!TextShape.has(miss)) {
        TextShape.create(miss, { text: 'Hits \n0', fontSize: 2 })
        console.log('miss: Give TextShape to entity: ', miss)
    }
    console.log('counter: Loading')
    if (!Transform.has(counter) || !TextShape.has(counter)) {
        Transform.create(counter, { ...toadsGameState.locatorsData.get('counter_score'), parent: sceneParentEntity })
        console.log('counter: Give Transform to entity: ', counter)
    }
    if (!TextShape.has(counter)) {
        TextShape.create(counter, { text: 'Hits \n0', fontSize: 2 })
        console.log('counter: Give TextShape to entity: ', counter)
    }

    console.log('frogs: Loading')
    for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) {
        if (!Transform.has(toadsGameState.availableEntity[i])) {
            Transform.create(toadsGameState.availableEntity[i], { position: { ...toadsGameState.locatorsData.get(`obj_frog_hidden_${i + 1}`)!.position, y: toadsGameState.toadInitialHeight }, parent: sceneParentEntity })
            console.log('frogs: Give Transform to entity: ', toadsGameState.availableEntity[i])
        }
        if (!GltfContainer.has(toadsGameState.availableEntity[i])) {
            GltfContainer.createOrReplace(toadsGameState.availableEntity[i], { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
            console.log('frogs: Give GltfContainer to entity: ', toadsGameState.availableEntity[i])
        }
    }
}

const playBackgroundMusic = () => {
    if (AudioSource.getMutable(mainThereme).volume != 0) AudioSource.getMutable(mainThereme).volume = 0
    else AudioSource.getMutable(mainThereme).volume = 0.07
}

const toggleVolume = () => {
    if (soundConfig.volume != 0) soundConfig.volume = 0
    else soundConfig.volume = 0.5
}