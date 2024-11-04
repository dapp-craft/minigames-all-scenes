import * as utils from '@dcl-sdk/utils'
import { engine, executeTask, GltfContainer, MeshCollider, MeshRenderer, TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { STEAMPUNK_SYNC_ID, steampunkGameConfig } from './gameConfig'
import { data, steampunkGameState } from './gameState'
import { Vector3 } from '@dcl/sdk/math'
import { syncEntity, parentEntity } from '@dcl/sdk/network'
import { GameLogic } from './game/gameLogic'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

const handlers = {
    start: () => {},
    exit: () => {},
    restart: () => {},
    toggleMusic: () => {},
    toggleSfx: () => {}
}

const libraryReady = initMiniGame('', TIME_LEVEL_MOVES, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

const MODELS: string[] = [
    'models/obj_floor.gltf'
]

executeTask(async () => {
    for (const model of MODELS) {
        const entity = engine.addEntity()
        GltfContainer.create(entity, {src: model})
        Transform.create(entity, {parent: sceneParentEntity})
    }
})


export async function main() {
    await libraryReady

    await generateInitialEntity()

    let game = new GameLogic()

    game.startGame()
}

const generateInitialEntity = async () => {
    for (let i = 0; i <= steampunkGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        steampunkGameState.availableEntity.push(entity)
    }

    const firstBoard = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 2]
    const secondBoard = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 3]
    const hits = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 4]
    const miss = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 5]
    const counter = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 6]
    // const cameraTrigger = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 7]
    
    syncEntity(firstBoard, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 2)
    syncEntity(secondBoard, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 3)
    syncEntity(hits, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 4)
    syncEntity(miss, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 5)
    syncEntity(counter, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 6)
    for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) syncEntity(steampunkGameState.availableEntity[i], [Transform.componentId, GltfContainer.componentId], STEAMPUNK_SYNC_ID + i)
    
    // const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    steampunkGameState.listOfEntity.set('firstBoard', firstBoard);
    steampunkGameState.listOfEntity.set('secondBoard', secondBoard);
    steampunkGameState.listOfEntity.set('hits', hits);
    steampunkGameState.listOfEntity.set('miss', miss);
    steampunkGameState.listOfEntity.set('counter', counter);
    // steampunkGameState.listOfEntity.set('cameraTrigger', cameraTrigger);

    if (Transform.getOrNull(hits) == null || TextShape.getOrNull(hits) == null) {
        Transform.create(hits, { ...data.get('counter_hits'), parent: sceneParentEntity })
        TextShape.create(hits, { text: 'Hits \n0', fontSize: 2 })
    }
    if (Transform.getOrNull(miss) == null || TextShape.getOrNull(hits) == null) {
        TextShape.create(miss, { text: 'Misses \n0', fontSize: 2 })
        Transform.create(miss, { ...data.get('counter_misses'), parent: sceneParentEntity })
    }
    if (Transform.getOrNull(counter) == null || TextShape.getOrNull(counter) == null) {
        TextShape.create(counter, { text: 'Score \n0', fontSize: 2 })
        Transform.create(counter, { ...data.get('counter_score'), parent: sceneParentEntity })
    }

    for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) {
        if (Transform.getOrNull(steampunkGameState.availableEntity[i]) == null || GltfContainer.getOrNull(steampunkGameState.availableEntity[i]) == null) {
            Transform.create(steampunkGameState.availableEntity[i], {...data.get(`plane${i + 1}`), parent: sceneParentEntity })
            // GltfContainer.createOrReplace(steampunkGameState.availableEntity[i], { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
            MeshRenderer.setPlane(steampunkGameState.availableEntity[i])
            MeshCollider.setPlane(steampunkGameState.availableEntity[i])
        }
    }
}
