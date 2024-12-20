import * as utils from '@dcl-sdk/utils'
import { engine } from "@dcl/sdk/ecs"
import { gameLogic } from ".."
import { cancelCountdown, runCountdown } from "../../../common/effects"

export const initGame = async () => {
    console.log('INIT GAME')
}

export function getReadyToStart() {
    console.log('Get Ready to start!')
    // soundManager.playSound('enterSounds', soundConfig.volume)
    exitCallback(false)
    runCountdown().then(() => startGame())
}

export function exitCallback(exit: boolean = true) {
    cancelCountdown()
    utils.timers.setTimeout(() => {
        // if (exit == true) soundManager.playSound('exitSounds', soundConfig.volume)
        gameLogic.stopGame()
        engine.removeSystem('countdown-system')
    }, 100)

}

export async function startGame() {
    const res = await gameLogic.startGame();
    console.log(res)
    // await updatePlayerProgress(res);
}