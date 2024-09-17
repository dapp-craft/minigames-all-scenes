import * as utils from '@dcl-sdk/utils'
import { getPlayer } from '@dcl/sdk/players'
import { gameLogic } from '..'
import { GameData } from '../state'
import { Entity } from '@dcl/sdk/ecs'

export let gameDataEntity: Entity
export let sessionStartedAt: number

export const initGame = () => {
    console.log('INIT GAME')
}

export function getReadyToStart() {
    console.log('Get Ready to start!')
    utils.timers.setTimeout(() => startGame(), 2000)
}

async function startGame() {
    const localPlayer = getPlayer()
    sessionStartedAt = Date.now()

    // soundManager.playSound('enterSounds', soundConfig.volume)

    const res = await gameLogic.startGame()
    console.log(res)

    GameData.createOrReplace(gameDataEntity, {
        playerAddress: localPlayer?.userId,
        playerName: localPlayer?.name
    })
}