export const GAME_ID = "2299ece9-d14d-4b2a-8cf8-08b8b1b6231b"

export const steampunkGameConfig = {
    initialEntityAmount: 100,
    targetEntityAmount: 80,
    hintShowTimes: 3,
    hintDelay: 1000,
    awardMultiplier: 10,
    winAnimationDuration: 3000,
    visibleFeedbackAlpha: 0.5,
    visibleFeedbackSpeed: 0.04,
    gameTime: 30000,
    maximumTexturePerType: 21,
    differentsObjectsPercentages: 0.25
}

export const levelAmount = 14

export const difficultyLevel = new Map([
    [1, [1, 2]],
    [2, [3, 4, 5, 6, 7, 8]],
    [3, [9, 10, 11, 12, 13, 14]]
])

export const soundConfig = {
    volume: 0.5
}

export const STEAMPUNK_SYNC_ID = 3000

export const hintsAmount: Array<number> = [3, 2, 1, 1, 1]