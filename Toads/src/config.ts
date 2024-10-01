import { Vector3 } from "@dcl/sdk/math"

export const GAME_ID = "5e68058a-2f02-4c51-9e22-198070bbcdcf"

export const toadsGameConfig = {
    initialEntityAmount: 20,
    ToadsAmount: 8,
    toadsDistance: .5,
    gameTime: 30000,
    hammerRadius: .7,
    hammerAltitude: 2,
    priceMultiplier: 10
}

export const animationConfig = {
    hitTIme: 400,
    hammerBounceTime: 500,
    frogStayTime: 5000,
    frogAfterHitHideTime: 100,
    frogEscapeTime: 2000,
}

export const TOADS_SYNC_ID = 3000

export const timer = {
    position: Vector3.create(-2.957981586456299, 4.053521156311035, -6.89)
}

export const steps = {
    position: Vector3.create(-2.957981586456299, 3.552783727645874, -6.89)
}

export const name = {
    position: Vector3.create(0, 5.161755561828613, -6.905980110168457)
}
