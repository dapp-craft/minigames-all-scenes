import * as utils from '@dcl-sdk/utils'
import { gameLogic } from ".."
import { cancelCountdown, runCountdown } from "../../../common/effects"
import { westGameConfig } from '../config'

export let startTimeOut = 0

export const initGame = async () => {
    console.log('INIT GAME')
}

export function getReadyToStart() {
    console.log('Get Ready to start!')
    // soundManager.playSound('enterSounds', soundConfig.volume)
    runCountdown(westGameConfig.timeBeforeStart)
    startTimeOut = utils.timers.setTimeout(() => startGame(), westGameConfig.timeBeforeStart * 1000 + 200)
}

export function exitCallback(exit: boolean = true) {
    cancelCountdown()
    utils.timers.setTimeout(() => {
        utils.timers.clearTimeout(startTimeOut)
        gameLogic.stopGame()
    }, 100)

}

export async function startGame() {
    console.log('game Sarted')
    const res = await gameLogic.startGame();
    console.log(res)
    // await updatePlayerProgress(res);
}