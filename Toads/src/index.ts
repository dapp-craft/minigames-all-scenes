import { AudioSource, CameraModeArea, CameraType, ColliderLayer, engine, GltfContainer, TextShape, Transform, Tween, VisibilityComponent } from '@dcl/sdk/ecs'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { exitCallback, getReadyToStart, initGame } from './game/game'
import { GAME_ID, soundConfig, TOADS_SYNC_ID, toadsGameConfig } from './config'
import { sceneParentEntity, toadsGameState } from './state'
import { GameLogic } from './game/gameLogic'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { frog01, hammer } from './resources/resources'
import { parentEntity, syncEntity } from '@dcl/sdk/network'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { mainThereme } from './game/soundManager'
import { SCORE } from '@dcl-sdk/mini-games/src/ui'
import { setupEffects } from '../../common/effects'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

const handlers = {
    start: () => { getReadyToStart() },
    exit: () => { exitCallback() },
    restart: () => getReadyToStart(),
    toggleMusic: () => playBackgroundMusic(),
    toggleSfx: () => toggleVolume()
}

const libraryReady = initMiniGame(GAME_ID, [SCORE], readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

export const gameLogic = new GameLogic()

export async function main() {
    setupEffects(Vector3.create(0, 2.5, -3));

    setupStaticModels()

    await libraryReady

    await generateInitialEntity()

    initGame()
}

const generateInitialEntity = async () => {
    const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)

    for (let i = 0; i <= toadsGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        toadsGameState.availableEntity.push(entity)
    }

    const hammerParent = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 1]
    const hammerEntity = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 2]
    const missTarget = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 3]
    const hits = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 4]
    const miss = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 5]
    const counter = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 6]
    const cameraTrigger = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 7]

    TextShape.create(hits, { text: 'Hits \n0', fontSize: 2 })
    TextShape.create(miss, { text: 'Misses \n0', fontSize: 2 })
    TextShape.create(counter, { text: 'Score \n0', fontSize: 2 })

    syncEntity(hammerParent, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 6)
    syncEntity(hammerEntity, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 1)
    syncEntity(missTarget, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 2)
    syncEntity(hits, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId, VisibilityComponent.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 3)
    syncEntity(miss, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId, VisibilityComponent.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 4)
    syncEntity(counter, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId, VisibilityComponent.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 5)
    syncEntity(cameraTrigger, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId, VisibilityComponent.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 7)


    Transform.createOrReplace(hammerParent)
    Transform.createOrReplace(hammerEntity, { parent: hammerParent })
    VisibilityComponent.create(hammerEntity, { visible: true })

    parentEntity(hammerEntity, hammerParent)

    Transform.create(hits, { position: { ...data.get('counter_hits')!.position, z: data.get('counter_hits')!.position.z + .2 }, scale: Vector3.create(.5, .5, .5), rotation: Quaternion.create(0, 100, 0), parent: sceneParentEntity })
    Transform.create(miss, { position: { ...data.get('counter_misses')!.position, z: data.get('counter_misses')!.position.z + .2 }, scale: Vector3.create(.5, .5, .5), rotation: Quaternion.create(0, 100, 0), parent: sceneParentEntity })
    Transform.create(counter, { position: { ...data.get('counter_score')!.position, z: data.get('counter_score')!.position.z + .2 }, scale: Vector3.create(.5, .5, .5), rotation: Quaternion.create(0, 100, 0), parent: sceneParentEntity })
    Transform.create(cameraTrigger, { position: Vector3.create(0, 2.5, -3), parent: sceneParentEntity })

    GltfContainer.createOrReplace(hammerEntity, hammer)

    toadsGameState.listOfEntity.set('hammerParent', hammerParent)
    toadsGameState.listOfEntity.set('hammer', hammerEntity)
    toadsGameState.listOfEntity.set('missTarget', missTarget);
    toadsGameState.listOfEntity.set('hits', hits);
    toadsGameState.listOfEntity.set('miss', miss);
    toadsGameState.listOfEntity.set('counter', counter);
    toadsGameState.listOfEntity.set('cameraTrigger', cameraTrigger);

    toadsGameState.toadInitialHeight = data.get(`obj_frog_hidden_1`)!.position.y
    toadsGameState.toadFinishHeight = data.get(`obj_frog_shown_1`)!.position.y
    Transform.create(missTarget, { position: { ...data.get(`obj_frog_hidden_1`)!.position, y: toadsGameState.toadInitialHeight } })

    for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) {
        Transform.createOrReplace(toadsGameState.availableEntity[i], { position: { ...data.get(`obj_frog_hidden_${i + 1}`)!.position, y: toadsGameState.toadInitialHeight }, parent: sceneParentEntity })
        GltfContainer.createOrReplace(toadsGameState.availableEntity[i], { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
        syncEntity(toadsGameState.availableEntity[i], [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], TOADS_SYNC_ID + i)
    }

    CameraModeArea.create(toadsGameState.listOfEntity.get('cameraTrigger'), {
        area: Vector3.create(13, 5, 8),
        mode: CameraType.CT_FIRST_PERSON,
    })
}

const playBackgroundMusic = () => {
    if (AudioSource.getMutable(mainThereme).volume != 0) AudioSource.getMutable(mainThereme).volume = 0
    else AudioSource.getMutable(mainThereme).volume = 0.07
}

const toggleVolume = () => {
    if (soundConfig.volume != 0) soundConfig.volume = 0
    else soundConfig.volume = 0.5
}