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

export function playPowerUpSound() {
  playSound('powerUp')
}

export function playHitSound() {
  playSound('hit')
}

export function playGameOverSound() {
  playSound('gameOver')
}

export function playPlaySound() {
  playSound('play')
}

export function playStartSound() {
  playSound('play')
}
