import { progress } from "@dcl-sdk/mini-games/src"
import { progressState } from "../gameState"
import { IProgress } from "@dcl-sdk/mini-games/src/progress"
import { levelAmount } from "../gameConfig"

export let playerProgress: IProgress

export async function updatePlayerProgress(data: typeof progressState) {
    console.log('Updating progress', playerProgress)
    await progress.upsertProgress({
        time: progressState.playerFinishTime - progressState.playerStartTime,
        level: progressState.playerLevel[levelAmount - 1],
        moves: progressState.playerScore
    })
}