import { progress } from '@dcl-sdk/mini-games/src'
import { IProgress } from '@dcl-sdk/mini-games/src/progress'
import { gameState } from './game'

export let playerProgress: IProgress

export async function fetchPlayerProgress() {
  console.log('Fetching progress', Object.keys(progress))
  let req = await progress.getProgress('level', progress.SortDirection.DESC, 1)
  console.log('Progress fetched', req)
  if (req?.length) playerProgress = req[0]
}

export async function updatePlayerProgress() {
  console.log('Updating progress', playerProgress)
  progress.upsertProgress({
    level: gameState.level,
    moves: gameState.moves,
    time: gameState.levelFinishTime - gameState.levelStartTime
  })
}
