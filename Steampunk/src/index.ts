import * as utils from '@dcl-sdk/utils'
import { engine, executeTask, GltfContainer, Material, MeshCollider, MeshRenderer, TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { STEAMPUNK_SYNC_ID, steampunkGameConfig } from './gameConfig'
import {  steampunkGameState } from './gameState'
import { syncEntity } from '@dcl/sdk/network'
import { GameLogic } from './game/gameLogic'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { getReadyToStart, initGame } from './game/game'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

const handlers = {
    start: () => getReadyToStart(),
    exit: () => { },
    restart: () => getReadyToStart(),
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
    await libraryReady

    await setupStaticModels()

    await generateInitialEntity()

    initGame()

    gameLogic.startGame()
}

const generateInitialEntity = async () => {

    // TODO SYNC

    for (let i = 0; i <= steampunkGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        steampunkGameState.availableEntity.push(entity)
    }

    const firstBoard = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 2]
    const secondBoard = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 3]
    const hits = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 4]

    syncEntity(firstBoard, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 2)
    syncEntity(secondBoard, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 3)
    syncEntity(hits, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 4)
    for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) syncEntity(steampunkGameState.availableEntity[i], [Transform.componentId, GltfContainer.componentId], STEAMPUNK_SYNC_ID + i)

    steampunkGameState.listOfEntity.set('firstBoard', firstBoard);
    steampunkGameState.listOfEntity.set('secondBoard', secondBoard);
    steampunkGameState.listOfEntity.set('hits', hits);

    console.log(Transform.get(steampunkGameState.listOfEntity.get('display')))

    const data = await readGltfLocators(`locators/obj_locators_unique1.gltf`)

    Transform.create(firstBoard, { ...data.get('Image1'), parent: steampunkGameState.listOfEntity.get('display') })
    Transform.create(secondBoard, { ...data.get('Image2'), parent: steampunkGameState.listOfEntity.get('display') })

    MeshRenderer.setPlane(firstBoard)
    MeshRenderer.setPlane(secondBoard)

    if (Transform.getOrNull(hits) == null || TextShape.getOrNull(hits) == null) {
        Transform.create(hits, { ...data.get('Counter'), parent: sceneParentEntity })
        TextShape.create(hits, { text: 'Hits \n0', fontSize: 2 })
    }
}
