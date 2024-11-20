import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity, ui } from "@dcl-sdk/mini-games/src"
import { gameLogic } from '..'
import { readGltfLocators } from '../../../common/locators'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { engine } from '@dcl/sdk/ecs'
import { steampunkGameConfig } from '../gameConfig'

let timer: ui.Timer3D
let startTimeOut: utils.TimerId

export const initGame = async () => {
    console.log('INIT GAME')

    spawnButton()

    await initCountdownNumbers()
}

export function getReadyToStart() {
    console.log('Get Ready to start!')
    // runCountdown().then(() => startGame())
    startGame()
}

async function startGame() {
    console.log("Start game")
    let res = await gameLogic.startGame()

    console.log("Response after game: ")
    console.log(res)
}

async function initCountdownNumbers() {
    const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    timer = new ui.Timer3D(
      {
        parent: sceneParentEntity,
        ...data.get('counter_stopwatch'),
      },
      1,
      1,
      false,
      24353
    )
    console.log(timer)
    timer.hide();
  }
  
  export async function countdown(cb: () => void, number: number, stop?: boolean) {
    let currentValue = number
    let time = stop ? 0 : 1
  
    engine.addSystem(
      (dt: number) => {
        time += dt
  
        if (time >= 1) {
          time = 0
          if (currentValue > 0) {
            timer.show()
            timer.setTimeAnimated(currentValue--)
          } else {
            timer.hide()
            engine.removeSystem('countdown-system')
            cb && cb()
          }
        }
      },
      undefined,
      'countdown-system'
    )
  }

const spawnButton = async () => {
    const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    new ui.MenuButton(
        { ...data.get("button_level_4")!, parent: sceneParentEntity },
        ui.uiAssets.shapes.RECT_PURPLE,
        ui.uiAssets.icons.hint,
        `HINT`,
        () => {
            gameLogic.getHint()
        },
        false,
        500
    )
    for (let i = 1; i <= 3; i++) {
        new ui.MenuButton(
            { ...data.get(`button_level_${i}`), parent: sceneParentEntity },
            ui.uiAssets.shapes.SQUARE_GREEN,
            ui.uiAssets.numbers[i],
            `Level ${i}`,
            () => {
                gameLogic.startGame(i)
            },
            false,
            500
        )
    }
}

// async function initCountdownNumbers() {
    // const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    // timer = new ui.Timer3D(
    //     {
    //         parent: sceneParentEntity,
    //         position: data.get('counter_countdown')?.position,
    //         rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    //         scale: Vector3.create(.5, .5, .5)
    //     },
    //     1,
    //     1,
    //     false,
    //     24353
    // )
    // console.log(timer)
    // timer.hide()
// }