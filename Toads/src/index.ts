import { ColliderLayer, engine, GltfContainer, Transform } from '@dcl/sdk/ecs'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { getReadyToStart, initGame } from './game/game'
import { toadsGameConfig } from './config'
import { sceneParentEntity, toadsGameState } from './state'
import { GameLogic } from './game/gameLogic'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { frog01, hammer } from './resources/resources'


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
    setupStaticModels()
    
    await libraryReady

    generateInitialEntity()
    
    // gameLogic.startGame()
    
    initGame()
}

const generateInitialEntity = async () => {
    const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    
    for (let i = 0; i <= toadsGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        toadsGameState.availableEntity.push(entity)
    }
    // const board = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 1]
    const hammerEntity = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 2]
    const missTarget = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 3]

    Transform.createOrReplace(hammerEntity)

    // Transform.create(board, { ...tempLocators.get(`Board`), parent: sceneParentEntity })
    
    // MeshRenderer.setPlane(board)
    // MeshCollider.setPlane(board)

    // toadsGameState.listOfEntity.set('board', board)
    toadsGameState.listOfEntity.set('hammer', hammerEntity)
    toadsGameState.listOfEntity.set('missTarget', missTarget)

    for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) {
        Transform.createOrReplace(toadsGameState.availableEntity[i], {position: data.get(`object_hole_${i + 1}`)?.position, parent: sceneParentEntity})
        GltfContainer.createOrReplace(toadsGameState.availableEntity[i], { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
    }

}
