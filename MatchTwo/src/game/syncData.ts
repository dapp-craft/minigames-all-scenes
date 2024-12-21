import { progress } from '@dcl-sdk/mini-games/src'
import { IProgress } from '@dcl-sdk/mini-games/src/progress'
import { gameState } from './game'
import { DISPENSER } from '..'

export let playerProgress: IProgress

export async function fetchPlayerProgress() {
  console.log('Fetching progress', Object.keys(progress))
  let req = await progress.getProgress('level', progress.SortDirection.DESC, 1)
  console.log('Progress fetched', req)
  
  if (!req?.length) return
  playerProgress = req[0]

  if (playerProgress.level >= 2) {
    DISPENSER.enableClaim()
  }

}

export async function updatePlayerProgress(data: typeof gameState) {
  console.log('Updating progress', playerProgress)

  if (gameState.level >= 2) {
    DISPENSER.enableClaim()
  }

  progress.upsertProgress({
    level: gameState.level,
    moves: gameState.moves,
    time: gameState.levelFinishTime - gameState.levelStartTime
  })
}