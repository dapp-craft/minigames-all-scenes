import { SoundManager } from './SoundManager'

export const soundManager = new SoundManager()
export let SFX_ENABLED = true

export function setSfxStatus(enabled: boolean) {
  SFX_ENABLED = enabled
}

export function playSound(sound: string, volume: number = 0.5) {
  if (!SFX_ENABLED) return
  soundManager.playSound(sound, volume)
}

export function playSLideSound() {
  playSound('slide', 1)
}

export function playWinSound() {
  playSound('win', 1)
}

export function playStartSound() {
  playSound('start', 1)
}
