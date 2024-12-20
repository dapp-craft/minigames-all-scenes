import { engine, executeTask, GltfContainer, MeshCollider, MeshRenderer, TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
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
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

const handlers = {
    start: () => { gameLogic.startGame() },
    exit: () => gameLogic.stopGame(),
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

let gameLogic = new GameLogic()

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

    for (let i = 0; i <= westGameConfig.targetEntityAmount * 3; i++) {
        syncEntity(westGameState.availableEntity[i], [Transform.componentId, VisibilityComponent.componentId, MeshRenderer.componentId], WEST_SYNC_ID + i)
    }

    westGameState.listOfEntity.set('playerHP', playerHP)
    westGameState.listOfEntity.set('score', score)

    const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    westGameState.curtainsScale = data.get(`obj_window_1`)!.scale;

    if (Transform.getOrNull(westGameState.availableEntity[0]) == null) {
        for (let i = 0; i < westGameConfig.targetEntityAmount - 1; i++) {
            Transform.create(westGameState.availableEntity[i + westGameConfig.targetEntityAmount], { position: Vector3.create(0, 1, 1), rotation: Quaternion.Zero(), parent: sceneParentEntity })
        }
        for (let i = 0; i <= westGameConfig.targetEntityAmount - 1; i++) {
            MeshRenderer.setPlane(westGameState.availableEntity[i])
            MeshCollider.setPlane(westGameState.availableEntity[i])
            VisibilityComponent.create(westGameState.availableEntity[i], { visible: false })
            Transform.create(westGameState.availableEntity[i], { position: Vector3.create(0, data.get(`obj_window_${i + 1}`)!.scale.y / 2.5, 0), rotation: Quaternion.Zero(), parent: westGameState.availableEntity[i + westGameConfig.targetEntityAmount] })
        }
    }
    if (Transform.getOrNull(westGameState.availableEntity[westGameConfig.targetEntityAmount * 3 + 1]) == null) {
        for (let i = 0; i <= westGameConfig.targetEntityAmount - 1; i++) {
            const entityData = data.get(`obj_window_${i + 1}`)
            Transform.create(westGameState.availableEntity[i + westGameConfig.targetEntityAmount * 2], { ...entityData, position: { ...entityData!.position, z: entityData!.position.z + .2 }, parent: sceneParentEntity })
            GltfContainer.create(westGameState.availableEntity[i + westGameConfig.targetEntityAmount * 2], { src: 'models/obj_curtains.gltf' })
        }
    }
    if (Transform.getOrNull(playerHP) == null) {
        TextShape.create(playerHP, { text: `HP \n${westGameConfig.playerMaxHP}`, fontSize: 2 })
        Transform.create(playerHP, { ...data.get('counter_lives'), parent: sceneParentEntity })
    }
    if (Transform.getOrNull(score) == null) {
        TextShape.create(score, { text: `Score \n0`, fontSize: 2 });
        Transform.create(score, { ...data.get('counter_score'), parent: sceneParentEntity })
    }
}