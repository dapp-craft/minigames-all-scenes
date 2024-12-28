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
    
    await generateInitialEntity()

    await libraryReady

    setupStaticModels()


    initGame()
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

    if (Transform.getOrNull(hammerParent) == null) {
        Transform.createOrReplace(hammerParent, { position: Vector3.create(8, 2, 2) })
    }
    if (Transform.getOrNull(hammerEntity) == null || VisibilityComponent.getOrNull(hammerEntity) == null) {
        Transform.createOrReplace(hammerEntity, { parent: hammerParent });
        VisibilityComponent.create(hammerEntity, { visible: false });
    }

    GltfContainer.createOrReplace(hammerEntity, hammer)
    parentEntity(hammerEntity, hammerParent)

    if (Transform.getOrNull(hits) == null || TextShape.getOrNull(hits) == null) {
        Transform.create(hits, { ...toadsGameState.locatorsData.get('counter_hits'), parent: sceneParentEntity })
        TextShape.create(hits, { text: 'Hits \n0', fontSize: 2 })
    }
    if (Transform.getOrNull(miss) == null || TextShape.getOrNull(hits) == null) {
        TextShape.create(miss, { text: 'Misses \n0', fontSize: 2 })
        Transform.create(miss, { ...toadsGameState.locatorsData.get('counter_misses'), parent: sceneParentEntity })
    }
    if (Transform.getOrNull(counter) == null || TextShape.getOrNull(counter) == null) {
        TextShape.create(counter, { text: 'Score \n0', fontSize: 2 })
        Transform.create(counter, { ...toadsGameState.locatorsData.get('counter_score'), parent: sceneParentEntity })
    }

    for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) {
        if (Transform.getOrNull(toadsGameState.availableEntity[i]) == null || GltfContainer.getOrNull(toadsGameState.availableEntity[i]) == null) {
            Transform.create(toadsGameState.availableEntity[i], { position: { ...toadsGameState.locatorsData.get(`obj_frog_hidden_${i + 1}`)!.position, y: toadsGameState.toadInitialHeight }, parent: sceneParentEntity })
            GltfContainer.createOrReplace(toadsGameState.availableEntity[i], { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
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