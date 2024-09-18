import { engine, executeTask, GltfContainer, MeshCollider, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { getReadyToStart, initGame } from './game/game'
import { tempLocators, toadsGameConfig } from './config'
import { toadsGameState } from './state'
import { GameLogic } from './game/gameLogic'


const handlers = {
    start: () => {getReadyToStart()},
    exit: () => {gameLogic.stopGame()},
    restart: () => { },
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

export const gameLogic = new GameLogic()


export async function main() {
    await libraryReady

    generateInitialEntity()

    // gameLogic.startGame()

    initGame()
}

const generateInitialEntity = () => {
    for (let i = 0; i <= toadsGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        toadsGameState.availableEntity.push(entity)
    }
    let board = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 1]
    Transform.create(board, { ...tempLocators.get(`Board`), parent: sceneParentEntity })
    MeshRenderer.setPlane(board)
    MeshCollider.setPlane(board)
    toadsGameState.listOfEntity.set('board', board)
}
