import { frog01, frog03, frog04, snake } from "./resources/resources"

export const GAME_ID = "5e68058a-2f02-4c51-9e22-198070bbcdcf"

export const toadsGameConfig = {
    initialEntityAmount: 20,
    ToadsAmount: 8,
    toadsDistance: .5,
    gameTime: 30000,
    frogTimeGap: 600,
    hammerRadius: .7,
    hammerAltitude: 2,
    priceMultiplier: 10,
    hammerHitDistMult: 2,
    initialTimeGap: 200
}

export const animationConfig = {
    hitTIme: 400,
    hammerBounceTime: 500,
    hammerSpeed: 10,
    frogStayTime: 3000,
    frogAfterHitHideTime: 100,
    frogEscapeTime: 1500,
}

export const hitTargetsConfig = new Map([
    ['DEFAULT', {
        weight: 7,
        frogStayTime: 3000,
        frogEscapeTime: 1500,
        price: 1,
        model: frog01
    }],
    ['GOLDEN', {
        weight: 3,
        frogStayTime: 2000,
        frogEscapeTime: 800,
        price: 2,
        model: frog03
    }],
    ['RUBY', {
        weight: 1,
        frogStayTime: 1000,
        frogEscapeTime: 500,
        price: 3,
        model: frog04
    }],
    ['SNAKE', {
        weight: 3,
        frogStayTime: 3000,
        frogEscapeTime: 1500,
        price: -3,
        model: snake
    }]
])

export const soundConfig = {
    volume: 0.5
}

export const TOADS_SYNC_ID = 5000