import { progress } from '@dcl-sdk/mini-games/src'
import { IProgress } from '@dcl-sdk/mini-games/src/progress'

export let playerProgress: IProgress


export async function updatePlayerProgress(score: number, time: number) {
  console.log('Updating progress  ', playerProgress)
  progress.upsertProgress({
    level: 1,
    time: time,
    score: score
  })
}
