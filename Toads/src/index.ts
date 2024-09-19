import { engine } from '@dcl/sdk/ecs'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { getReadyToStart, initGame } from './game/game'
import { toadsGameConfig } from './config'
import { toadsGameState } from './state'
import { GameLogic } from './game/gameLogic'
import { setupStaticModels } from './staticModels/setupStaticModels'


const handlers = {
    start: () => {getReadyToStart()},
    exit: () => {gameLogic.stopGame()},
    restart: () => {
        gameLogic.stopGame()
        getReadyToStart()
    },
    toggleMusic: () => { },
    toggleSfx: () => { }
}

const libraryReady = initMiniGame('', TIME_LEVEL_MOVES, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

export const gameLogic = new GameLogic()

export async function main() {
    await libraryReady

    generateInitialEntity()

    setupStaticModels()

    // gameLogic.startGame()

    initGame()
}

const generateInitialEntity = () => {
    for (let i = 0; i <= toadsGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        toadsGameState.availableEntity.push(entity)
    }
    // const board = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 1]
    const hammerEntity = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 2]

    // Transform.create(board, { ...tempLocators.get(`Board`), parent: sceneParentEntity })
    
    // MeshRenderer.setPlane(board)
    // MeshCollider.setPlane(board)

    // toadsGameState.listOfEntity.set('board', board)
    toadsGameState.listOfEntity.set('hammer', hammerEntity)

}
