import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity, ui } from "@dcl-sdk/mini-games/src"
import { readGltfLocators } from '../../../common/locators'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { runCountdown } from '../../../common/effects'

let timer: ui.Timer3D
let playButton: ui.MenuButton
let startTimeOut: utils.TimerId

export const initGame = async () => {
    console.log('INIT GAME')

    await initCountdownNumbers()
}

export function getReadyToStart() {
    console.log('Get Ready to start!')
    runCountdown().then(() => startGame())
}

async function startGame() {}

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