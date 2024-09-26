import { ColliderLayer, engine, GltfContainer, Transform, Tween, VisibilityComponent } from '@dcl/sdk/ecs'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { exitCallback, getReadyToStart, initGame } from './game/game'
import { GAME_ID, TOADS_SYNC_ID, toadsGameConfig } from './config'
import { sceneParentEntity, toadsGameState } from './state'
import { GameLogic } from './game/gameLogic'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { frog01, hammer } from './resources/resources'
import { parentEntity, syncEntity } from '@dcl/sdk/network'

const preset = {
    placementStart: 0.06,
    nameStart: 0.08,
    timeStart: 0.7,
    levelStart: 0.96,
    nameHeader: 'PLAYER',
    // timeHeader: 'TIME',
    levelHeader: 'LEVEL'
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

const libraryReady = initMiniGame(GAME_ID, TIME_LEVEL_MOVES, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

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
    const hammerEntity = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 2]
    const missTarget = toadsGameState.availableEntity[toadsGameConfig.ToadsAmount + 3]

    syncEntity(hammerEntity, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 1)
    syncEntity(missTarget, [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], TOADS_SYNC_ID + toadsGameConfig.ToadsAmount + 2)

    Transform.createOrReplace(hammerEntity)

    toadsGameState.listOfEntity.set('hammer', hammerEntity)
    toadsGameState.listOfEntity.set('missTarget', missTarget)

    toadsGameState.toadInitialHeight = data.get(`object_hole_1`)!.position.y - .3

    for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) {
        Transform.createOrReplace(toadsGameState.availableEntity[i], { position: { ...data.get(`object_hole_${i + 1}`)!.position, y: toadsGameState.toadInitialHeight }, parent: sceneParentEntity })
        GltfContainer.createOrReplace(toadsGameState.availableEntity[i], { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
        syncEntity(toadsGameState.availableEntity[i], [Transform.componentId, VisibilityComponent.componentId, GltfContainer.componentId, Tween.componentId], TOADS_SYNC_ID + i)
    }
}
