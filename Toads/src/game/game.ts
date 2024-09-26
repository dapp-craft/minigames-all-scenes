import * as utils from '@dcl-sdk/utils'
import { getPlayer } from '@dcl/sdk/players'
import { gameLogic } from '..'
import { GameData } from '../state'
import { Entity } from '@dcl/sdk/ecs'
import { initStatusBoard } from './initStatusBoard'
import { fetchPlayerProgress } from './syncData'
import { progress } from '@dcl-sdk/mini-games/src'

export let gameDataEntity: Entity
export let sessionStartedAt: number

let maxProgress: progress.IProgress

export const initGame = async () => {
    console.log('INIT GAME')

    await initMaxProgress();

    await fetchPlayerProgress();
    
    initStatusBoard()

}

export function getReadyToStart() {
    console.log('Get Ready to start!')
    utils.timers.setTimeout(() => startGame(), 2000)
}

export function exitCallback() {
    gameLogic.stopGame()
    GameData.createOrReplace(gameDataEntity, {
        playerAddress: '',
        playerName: '',
        moves: 0,
    })
}

async function startGame() {
    const localPlayer = getPlayer()
    sessionStartedAt = Date.now()

    // soundManager.playSound('enterSounds', soundConfig.volume)

    const res = await gameLogic.startGame()
    console.log(res)

    GameData.createOrReplace(gameDataEntity, {
        level: 1,
        moves: res.correct - res.miss,
        playerAddress: localPlayer?.userId,
        playerName: localPlayer?.name
    })
}

async function initMaxProgress() {
    console.log('Fetching progress', Object.keys(progress))
    let req = await progress.getProgress('level', progress.SortDirection.DESC, 1)
    if (req?.length) maxProgress = req[0]
}