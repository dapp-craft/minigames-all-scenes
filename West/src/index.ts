import { engine, executeTask, GltfContainer, MeshCollider, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { setupEffects } from '../../common/effects'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { tempLocators, westGameConfig } from './config'
import { westGameState } from './state'
import { GameLogic } from './game/gameLogic'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

const handlers = {
    start: () => { gameLogic.startGame()},
    exit: () => { },
    restart: () => gameLogic.startGame(),
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
    // gameLogic.startGame()
}

const generateInitialEntity = async () => {
    for (let i = 0; i <= westGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        westGameState.availableEntity.push(entity)
    }

    for (let i = 0; i < westGameConfig.targetEntityAmount; i++) {
        if (Transform.getOrNull(westGameState.availableEntity[i]) == null) {
            MeshRenderer.setPlane(westGameState.availableEntity[i])
            MeshCollider.setPlane(westGameState.availableEntity[i])
            Transform.create(westGameState.availableEntity[i], {position: Vector3.create(1, 1, 2), rotation: Quaternion.Zero()})
        }
    }

}