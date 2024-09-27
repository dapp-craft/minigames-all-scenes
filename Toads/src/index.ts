import { ColliderLayer, engine, GltfContainer, TextShape, Transform, Tween, VisibilityComponent } from '@dcl/sdk/ecs'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { exitCallback, getReadyToStart, initGame } from './game/game'
import { GAME_ID, TOADS_SYNC_ID, toadsGameConfig } from './config'
import { sceneParentEntity, toadsGameState } from './state'
import { GameLogic } from './game/gameLogic'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { frog01, hammer } from './resources/resources'
import { parentEntity, syncEntity } from '@dcl/sdk/network'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

const preset = {
    placementStart: 0.06,
    nameStart: 0.08,
    scoreStart: 0.90,
    nameHeader: 'PLAYER',
    scoreHeader: 'MOVES',
}

const handlers = {
    start: () => { getReadyToStart() },
    exit: () => { exitCallback() },
    restart: () => {
        gameLogic.stopGame();
        getReadyToStart()
    },
    toggleMusic: () => { },
    toggleSfx: () => { }
}

const libraryReady = initMiniGame(GAME_ID, preset, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

export const gameLogic = new GameLogic()

export async function main() {
    setupStaticModels()

    await libraryReady

    await generateInitialEntity()

    // gameLogic.startGame()

    initGame()
}

const generateInitialEntity = async () => {
    const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)

    for (let i = 0; i <= toadsGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        toadsGameState.availableEntity.push(entity)
    }
    const hammerEntity = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 2]
    const missTarget = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 3]
    const hits = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 4]
    const miss = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 5]
    const counter = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 6]

    console.log("hhghghghhgh");
    console.log(hits, miss, counter)

    TextShape.create(hits, { text: '0', fontSize: 3 })
    TextShape.create(miss, { text: '0', fontSize: 3 })
    TextShape.create(counter, { text: '0', fontSize: 3 })

    syncEntity(hammerEntity, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 1)
    syncEntity(missTarget, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 2)
    syncEntity(hits, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId, VisibilityComponent.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 3)
    syncEntity(miss, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId, VisibilityComponent.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 4)
    syncEntity(counter, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId, VisibilityComponent.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 5)

    Transform.createOrReplace(hammerEntity)

    Transform.create(hits, { position: { ...data.get('counter_hits')!.position, z: data.get('counter_hits')!.position.z + .2 }, scale: Vector3.create(.5, .5, .5), rotation: Quaternion.create(0, 100, 0), parent: sceneParentEntity })
    Transform.create(miss, { position: { ...data.get('counter_misses')!.position, z: data.get('counter_misses')!.position.z + .2 }, scale: Vector3.create(.5, .5, .5), rotation: Quaternion.create(0, 100, 0), parent: sceneParentEntity })
    Transform.create(counter, { position: { ...data.get('counter_score')!.position, z: data.get('counter_score')!.position.z + .2 }, scale: Vector3.create(.5, .5, .5), rotation: Quaternion.create(0, 100, 0), parent: sceneParentEntity })

    // VisibilityComponent.create(hits, { visible: false })
    // VisibilityComponent.create(miss, { visible: false })
    // VisibilityComponent.create(counter, { visible: false })
    
    toadsGameState.listOfEntity.set('hammer', hammerEntity)
    toadsGameState.listOfEntity.set('missTarget', missTarget);
    toadsGameState.listOfEntity.set('hits', hits);
    toadsGameState.listOfEntity.set('miss', miss);
    toadsGameState.listOfEntity.set('counter', counter);
    
    toadsGameState.listOfEntity.forEach((e, k) => console.log(k, e))

    toadsGameState.toadInitialHeight = data.get(`object_hole_1`)!.position.y - .3
    Transform.create(missTarget, { position: { ...data.get(`object_hole_1`)!.position, y: toadsGameState.toadInitialHeight } })

    for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) {
        Transform.createOrReplace(toadsGameState.availableEntity[i], { position: { ...data.get(`object_hole_${i + 1}`)!.position, y: toadsGameState.toadInitialHeight }, parent: sceneParentEntity })
        GltfContainer.createOrReplace(toadsGameState.availableEntity[i], { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
        syncEntity(toadsGameState.availableEntity[i], [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], TOADS_SYNC_ID + i)
    }
}
