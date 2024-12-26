import { engine, executeTask, GltfContainer, Material, MeshCollider, MeshRenderer, TextShape, Transform, Tween, VisibilityComponent } from '@dcl/sdk/ecs'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { setupEffects } from '../../common/effects'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { WEST_SYNC_ID, westGameConfig } from './config'
import { westGameState } from './state'
import { GameLogic } from './game/gameLogic'
import { syncEntity } from '@dcl/sdk/network'
import { exitCallback, getReadyToStart, startGame } from './game/game'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

const handlers = {
    start: () => { getReadyToStart() },
    exit: () => exitCallback(),
    restart: () => gameLogic.restartGame(),
    toggleMusic: () => { },
    toggleSfx: () => { }
}

const libraryReady = initMiniGame('', TIME_LEVEL_MOVES, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

const MODELS: string[] = [
    'models/obj_floor.gltf'
]

executeTask(async () => {
    for (const model of MODELS) {
        const entity = engine.addEntity()
        GltfContainer.create(entity, { src: model })
        Transform.create(entity, { parent: sceneParentEntity })
    }
})

export let gameLogic = new GameLogic()

export async function main() {
    setupEffects(Vector3.create(0, 2.7, -6));
    await libraryReady
    setupStaticModels();
    await generateInitialEntity()
}

const generateInitialEntity = async () => {
    for (let i = 0; i <= westGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        westGameState.availableEntity.push(entity)
    }

    const playerHP = westGameState.availableEntity[westGameConfig.targetEntityAmount * 3 + 1]
    const score = westGameState.availableEntity[westGameConfig.targetEntityAmount * 3 + 2]

    syncEntity(playerHP, [Transform.componentId, TextShape.componentId], WEST_SYNC_ID + westGameConfig.targetEntityAmount * 3 + 1)
    syncEntity(score, [Transform.componentId, TextShape.componentId], WEST_SYNC_ID + westGameConfig.targetEntityAmount * 3 + 2)
    for (let i = 0; i < westGameConfig.targetEntityAmount; i++) {
        syncEntity(westGameState.availableEntity[i], [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Material.componentId], WEST_SYNC_ID + i)
        syncEntity(westGameState.availableEntity[i + westGameConfig.targetEntityAmount], [Transform.componentId], WEST_SYNC_ID + i + westGameConfig.targetEntityAmount)
        syncEntity(westGameState.availableEntity[i + westGameConfig.targetEntityAmount * 2], [Transform.componentId, GltfContainer.componentId], WEST_SYNC_ID + i + westGameConfig.targetEntityAmount * 2)
    }

    westGameState.listOfEntity.set('playerHP', playerHP)
    westGameState.listOfEntity.set('score', score)

    westGameState.locatorData = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    westGameState.curtainsScale = westGameState.locatorData.get(`obj_curtain_1`)!.scale;

    for (let i = 0; i < westGameConfig.targetEntityAmount; i++) {
        if (Transform.getOrNull(westGameState.availableEntity[i + westGameConfig.targetEntityAmount]) == null) Transform.create(westGameState.availableEntity[i + westGameConfig.targetEntityAmount], { position: Vector3.create(0, 1, 1), rotation: Quaternion.Zero(), parent: sceneParentEntity })
        if (Transform.getOrNull(westGameState.availableEntity[i]) == null) {
            VisibilityComponent.create(westGameState.availableEntity[i], { visible: false })
            Transform.create(westGameState.availableEntity[i], { position: Vector3.create(0, westGameState.locatorData.get(`obj_window_${i + 1}`)!.scale.y / 2.5, 0), rotation: Quaternion.Zero(), parent: westGameState.availableEntity[i + westGameConfig.targetEntityAmount] })
            // scale: Vector3.create(5, 5, 5)
            MeshRenderer.setPlane(westGameState.availableEntity[i])
            MeshCollider.setPlane(westGameState.availableEntity[i])
        }
        if (Transform.getOrNull(westGameState.availableEntity[westGameConfig.targetEntityAmount * 2 + i]) == null) {
            const entityData = westGameState.locatorData.get(`obj_curtain_${i + 1}`)
            Transform.create(westGameState.availableEntity[i + westGameConfig.targetEntityAmount * 2], { ...entityData, parent: sceneParentEntity })
            GltfContainer.create(westGameState.availableEntity[i + westGameConfig.targetEntityAmount * 2], { src: 'models/obj_curtains.gltf' })
        }

    }
    // if (Transform.getOrNull(westGameState.availableEntity[westGameConfig.targetEntityAmount * 3 + 1]) == null) {
    //     for (let i = 0; i < westGameConfig.targetEntityAmount; i++) {
    //         const entityData = westGameState.locatorData.get(`obj_curtain_${i + 1}`)
    //         Transform.create(westGameState.availableEntity[i + westGameConfig.targetEntityAmount * 2], { ...entityData, parent: sceneParentEntity })
    //         GltfContainer.create(westGameState.availableEntity[i + westGameConfig.targetEntityAmount * 2], { src: 'models/obj_curtains.gltf' })
    //     }
    // }
    if (Transform.getOrNull(playerHP) == null) {
        TextShape.create(playerHP, { text: `HP \n${westGameConfig.playerMaxHP}`, fontSize: 2 })
        Transform.create(playerHP, { ...westGameState.locatorData.get('counter_lives'), parent: sceneParentEntity })
    }
    if (Transform.getOrNull(score) == null) {
        TextShape.create(score, { text: `Score \n0`, fontSize: 2 });
        Transform.create(score, { ...westGameState.locatorData.get('counter_score'), parent: sceneParentEntity })
    }
}