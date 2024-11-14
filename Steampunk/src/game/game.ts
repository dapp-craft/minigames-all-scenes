import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity, ui } from "@dcl-sdk/mini-games/src"
import { gameLogic } from '..'
import { readGltfLocators } from '../../../common/locators'
import { Vector3 } from '@dcl/sdk/math'

let timer: ui.Timer3D
let playButton: ui.MenuButton
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

const spawnButton = async () => {
    const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    playButton = new ui.MenuButton(
        { ...data.get("Counter")!, parent: sceneParentEntity },
        ui.uiAssets.shapes.SQUARE_GREEN,
        ui.uiAssets.icons.play,
        `PLAY`,
        () => {
            gameLogic.getHint()
        },
        false,
        500
    )
    for (let i = 1; i <= 3; i++) {
        new ui.MenuButton(
            { position: { ...data.get("Counter")!.position, y: data.get("Counter")!.position.y - .5, x: data.get("Counter")!.position.x + i - 2 }, parent: sceneParentEntity },
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

async function initCountdownNumbers() {
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
}