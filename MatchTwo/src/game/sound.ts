import { soundManager } from '../globals'

export let SFX_ENABLED = true

export function playSound(sound: string) {
  if (!SFX_ENABLED) return
  soundManager.playSound(sound)
}

export function playOpenTileSound() {
  const soundToPlay = Math.random() > 0.5 ? 'openTile1' : 'openTile2'
  playSound(soundToPlay)
}

export function playCloseTileSound() {
  const soundToPlay = Math.random() > 0.5 ? 'closeTile1' : 'closeTile2'
  console.log("Random", Math.random())
  playSound(soundToPlay)
}

export function playPairFoundSound() {
  playSound('pairFound')
}

export function playLevelCompleteSound() {
  playSound('levelComplete')
}
