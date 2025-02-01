import { progress } from "@dcl-sdk/mini-games/src"
import { IProgress } from "@dcl-sdk/mini-games/src/progress"
import { gameState } from "./types"

export let playerProgress: IProgress

export async function fetchPlayerProgress() {
  let req = await progress.getProgress('level', progress.SortDirection.DESC, 1)
  if (req?.length) playerProgress = req[0]
}

export async function updatePlayerProgress() {
  progress.upsertProgress({
    level: gameState.level,
    moves: gameState.moves,
    time: gameState.levelFinishTime - gameState.levelStartTime
  })
}