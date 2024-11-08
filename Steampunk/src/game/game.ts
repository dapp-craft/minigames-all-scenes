import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity, ui } from "@dcl-sdk/mini-games/src"
import { gameLogic } from '..'
import { readGltfLocators } from '../../../common/locators'

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

async function startGame() { }

const spawnButton = async () => {
    const data = await readGltfLocators(`locators/obj_locators_unique1.gltf`)
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