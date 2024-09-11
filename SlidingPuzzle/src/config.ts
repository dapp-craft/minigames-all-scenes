

export const GAME_ID = '001c138f-e6e4-4a79-812e-406e2219f464'
export let EASY_MODE = false

export function setEasyMode(value: boolean) {
  EASY_MODE = value
}

export const DEBUG_MODE_UI = false

export const SESSION_DURATION = 1000 * 60 * 5 // 5 minutes