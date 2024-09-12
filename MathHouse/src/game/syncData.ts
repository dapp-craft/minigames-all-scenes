import { progress } from '@dcl-sdk/mini-games/src'
import { IProgress } from '@dcl-sdk/mini-games/src/progress'
import { progressState } from './game'


export let playerProgress: IProgress

export async function fetchPlayerProgress() {
  console.log('Fetching progress', Object.keys(progress))
  let req = await progress.getProgress('level', progress.SortDirection.DESC, 1)
  console.log('Progress fetched', req)
  if (req?.length) playerProgress = req[0]
}

export async function updatePlayerProgress(data: typeof progressState) {
  console.log('Updating progress', playerProgress)
  progress.upsertProgress({
    level: progressState.level,
  })
}