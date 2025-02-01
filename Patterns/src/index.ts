import { engine, Entity, executeTask, GltfContainer, MeshCollider, MeshRenderer, Schemas, Transform, TransformType } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { queue, sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { CreateStateSynchronizer } from '../../common/synchronizer'
import { STATIC_MODELS } from './resources'
import { MAX_LEVEL, SYNC_ENTITY_ID, tempLocators } from './config'
import { LEVELS } from './levels'
import { FlowController } from './utils'
import { playerProgress } from './game/syncData'
import { DotType, gameState } from './game/types'
import { getPlayer } from '@dcl/sdk/players'
import { Game, SyncState } from './game/gameLogic'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

export let inGame = false

export let gameLogic: Game

const handlers = {
    start: () => { },
    exit: () => { },
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

export async function main() {
    await libraryReady

    const levetToStart = (playerProgress?.level ?? 0) + 1 > MAX_LEVEL ? MAX_LEVEL : (playerProgress?.level ?? 0) + 1
    gameLogic = new Game(levetToStart)

}

const readLevel = (level: number) => {
    const levelData = LEVELS[level]
    const coordinates = [];
    for (let value = 1; value <= levelData.dotMat.length * 2; value++) {
        for (let row = 0; row < levelData.dotMat.length; row++) {
            for (let col = 0; col < levelData.dotMat[row].length; col++) {
                if (levelData.dotMat[row][col] === value) {
                    coordinates.push({ value, row, col });
                    break;
                }
            }
        }
    }
    console.log(coordinates)
    return coordinates
}

export function getReadyToStart(level: number) {

}