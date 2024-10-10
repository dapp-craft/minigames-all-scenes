import { Vector3 } from "@dcl/sdk/math"
import { DEFAULT_TIMEOUTS } from "../../common/library"

export const GAME_ID = "040ff183-c10a-4fba-8800-881cf9bda930"

export const SESSION_DURATION = 1000 * 60 * 5

export const modelPath = new Map([
])

export const entityAmount = 9
export const counterEntity = 2

export const entityConfig = {
    distance: 5,
    initialEntitySize: .1,
    spacing: -.2,
    maxRowLength: 1.5,
}

export const timerConfig = {
  catIconAnimationTime: 300,
  initialCatTimeGap: 400,
  additionCatTimeGap: 100,
}

export const rocketCoords = [8, 1, 3.5]
export const startCoords = [14, .5, 3]
export const finishCoords = [2, .5, 3]

export const MAX_LEVEL = 9
export const mainEntityId = 5000
export const catEntityId = 3000
export const catInRocketEntityId = 4000

export const initialLevels = new Map([
  [1, { length: 3, positive: true, initialNumber: 0 }],
  [2, { length: 3, positive: true, initialNumber: 3 }],
  [3, { length: 3, positive: false, initialNumber: 7 }],
  [4, { length: 3, positive: false, initialNumber: 9 }],
])

export const timer = {
  position: Vector3.create(-2.957981586456299, 4.053521156311035, -6.89)
}

export const steps = {
  position: Vector3.create(-2.957981586456299, 3.552783727645874, -6.89)
}

export const name = {
  position: Vector3.create(0, 5.161755561828613, -6.905980110168457)
}

export const soundConfig = {
  volume: 0.5
}

export const maxLevel = 50

export const gameTime = {
  inactivity: 45
}


