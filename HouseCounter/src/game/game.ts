import { progress, queue, sceneParentEntity, ui } from "@dcl-sdk/mini-games/src"
import { mainEntityId } from "../config"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { engine, Entity, TextShape, Transform } from "@dcl/sdk/ecs"
import { syncEntity } from "@dcl/sdk/network"
import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'
import { GameData, gameState, rocketCoords } from "../state"
import { movePlayerTo } from "~system/RestrictedActions"
import { gameEntityManager } from "../entityManager"
import { lvl0 } from "../leavels"
import { rocketBoard } from ".."

const BOARD_TRANSFORM = {
    position: { x: 8, y: 2.6636881828308105, z: 1.0992899895 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: Quaternion.fromAngleAxis(180, Vector3.create(0, 1, 0))
}

export let gameDataEntity: Entity

export let boardEntity: Entity
let gameButtons: ui.MenuButton[] = []
let maxProgress: progress.IProgress
let timer: ui.Timer3D
let playerAnswer = 0
let entityCounter = -1
export let sessionStartedAt: number
let entityManager: any

export const initGame = async () => {
    await initMaxProgress()

    initBoard()

    initGameButtons()

    initCountdownNumbers()
    queue.listeners.onActivePlayerChange = (player) => {
        const localPlayer = getPlayer()
        if (player?.address === localPlayer?.userId) {
            getReadyToStart()
        } else {
            entityManager.stopGame()
            GameData.createOrReplace(gameDataEntity, {
                playerAddress: '',
                playerName: '',
                moves: 0,
                levelStartedAt: 0,
                levelFinishedAt: 0
            })
        }
    }
}

function getReadyToStart() {
    console.log('Get Ready to start!')

    utils.timers.setTimeout(() => {
        startGame();
    }, 2000)
}

async function startGame() {
    const localPlayer = getPlayer()
    sessionStartedAt = Date.now()

    movePlayerTo({
        newRelativePosition: Vector3.create(8, 1, 8),
        cameraTarget: Vector3.subtract(Transform.get(boardEntity).position, Vector3.Up())
    })

    gameButtons.forEach((button, i) => button.disable())

    entityCounter = -1
    rocketBoard.showBoard(lvl0.initialEntityAmount)
    entityManager = new gameEntityManager(lvl0);
    entityCounter = await entityManager.startGame()

    gameButtons.forEach((button, i) => button.enable())

    GameData.createOrReplace(gameDataEntity, {
        playerAddress: localPlayer?.userId,
        playerName: localPlayer?.name
    })
}

function initBoard() {
    boardEntity = engine.addEntity()
    Transform.create(boardEntity, BOARD_TRANSFORM)
    syncEntity(boardEntity, [Transform.componentId], mainEntityId + 1)
}

async function initMaxProgress() {
    console.log('Fetching progress', Object.keys(progress))
    let req = await progress.getProgress('level', progress.SortDirection.DESC, 1)
    if (req?.length) maxProgress = req[0]
}

function initCountdownNumbers() {
    timer = new ui.Timer3D(
        {
            parent: sceneParentEntity,
            position: Vector3.create(5, 3, -6),
            rotation: Quaternion.fromEulerDegrees(0, 0, 0)
        },
        1,
        1,
        false,
        10
    )
    console.log(timer)
    timer.hide()
}

const initGameButtons = () => {
    gameButtons.push(
        new ui.MenuButton(
            {
                position: Vector3.create(8, 1, 11),
                scale: Vector3.create(1.5, 1.5, 1.5),
                rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
            },
            ui.uiAssets.shapes.SQUARE_GREEN,
            ui.uiAssets.icons.play,
            `START LEVEL 1`,
            async () => {
                if (gameState.rocketWindow) {Transform.getMutable(gameState.rocketWindow).position = rocketCoords}
                queue.addPlayer()
            }
        )
    )

    // for (let i = 1; i <= 9; i++) {
    //     gameButtons.push(new ui.MenuButton({
    //         position: Vector3.create(9.5, 1, 5),
    //         scale: Vector3.create(1.5, 1.5, 1.5),
    //         rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    //     },
    //         ui.uiAssets.shapes.SQUARE_RED,
    //         ui.uiAssets.numbers[i],
    //         `${i}`,
    //         () => {
    //             playerAnswer = i
    //         }
    //     ))
    // }

    gameButtons.push(new ui.MenuButton({
        position: Vector3.create(9.5, 1, 5),
        scale: Vector3.create(1.5, 1.5, 1.5),
        rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.leftArrow,
        "-1",
        () => {
            playerAnswer--
        }
    ))

    gameButtons.push(new ui.MenuButton({
        position: Vector3.create(6.5, 1, 5),
        scale: Vector3.create(1.5, 1.5, 1.5),
        rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.rightArrow,
        "+1",
        () => {
            playerAnswer++
        }
    ))

    gameButtons.push(new ui.MenuButton({
        position: Vector3.create(6, 1, 5),
        scale: Vector3.create(1.5, 1.5, 1.5),
        rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.hint,
        "CONFIRM",
        () => {
            console.log(entityCounter, playerAnswer)
            if (entityCounter == playerAnswer) {
                console.log("WIN WIN WIN WIN WIN")
                rocketBoard.showBoard(entityCounter)
            }
            else console.log("LOSE")
        }
    ))

    const sign = engine.addEntity()

    Transform.create(sign, {
        position: Vector3.create(8, 1, 5),
        rotation: { x: 0, y: 1, z: 0, w: 0 }
    })

    TextShape.create(sign, {
        text: `${playerAnswer}`,
        fontSize: 5,
    })

    engine.addSystem(() => {
        if (playerAnswer < 0) {
            playerAnswer = 0
            return
        }
        TextShape.getMutable(sign).text = `${playerAnswer}`
    })
}

export const initialEntity = (count: number) => {

}