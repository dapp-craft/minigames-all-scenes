import { progress } from '@dcl-sdk/mini-games/src'
import { IProgress } from '@dcl-sdk/mini-games/src/progress'
import { progressState } from '../state'


export let playerProgress: IProgress

export async function updatePlayerProgress(data: typeof progressState) {
  console.log('Updating progress', playerProgress)
  progress.upsertProgress({
    time: data.time,
    level: data.level,
    score: data.score
  })
}