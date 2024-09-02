import { progress, queue, sceneParentEntity, ui } from "@dcl-sdk/mini-games/src"
import { mainEntityId, MAX_LEVEL } from "../config"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { engine, Entity, Transform } from "@dcl/sdk/ecs"
import { syncEntity } from "@dcl/sdk/network"
import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'
import { GameData } from "../state"
import { movePlayerTo } from "~system/RestrictedActions"
import { gameEntityManager } from "../entityManager"
import { lvl0 } from "../leavels"

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
export let sessionStartedAt: number

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
        startGame()
    }, 2000)
}

async function startGame() {
    const localPlayer = getPlayer()
    sessionStartedAt = Date.now()

    GameData.createOrReplace(gameDataEntity, {
        playerAddress: localPlayer?.userId,
        playerName: localPlayer?.name
    })

    // movePlayerTo({
    //     newRelativePosition: Vector3.create(8, 1, 5),
    //     cameraTarget: Vector3.subtract(Transform.get(boardEntity).position, Vector3.Up())
    // })
    console.log('Max progress', maxProgress)
    const levelToStart = maxProgress?.level ? Math.min(maxProgress?.level + 1, MAX_LEVEL) : 1
    console.log('Starting level', levelToStart)

    gameButtons.forEach((button, i) => {
        if (i <= MAX_LEVEL - 1) {
          //set level buttons according to currentLevel
          //TODO: check max level played on progress
          if (i < maxProgress?.level + 1 || i == 0) {
            button.enable()
          } else {
            button.disable()
          }
        } else {
          button.enable()
        }
      })

    // setTilesPointerEvents()
    // startNewLevel(levelToStart)
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
            position: Vector3.create(0, 3, -6),
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
                parent: sceneParentEntity,
                // position: levelButtons[i + 1].position,
                position: Vector3.create(0, 1, 3),
                scale: Vector3.create(1.5, 1.5, 1.5),
                rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
            },
            ui.uiAssets.shapes.SQUARE_GREEN,
            ui.uiAssets.numbers[1],
            `START LEVEL 1`,
            async () => {
                // startNewLevel(i + 1)
                // console.log("New lvl")
                // button.enable()
                queue.addPlayer()
                const entityManager = new gameEntityManager(lvl0);
                await entityManager.startGame()
                
            }
        )
    )

    // gameButtons.push(new ui.MenuButton({
    //     parent: sceneParentEntity,
    //     position: Vector3.create(-1, 1, 3),
    //     scale: Vector3.create(1.5, 1.5, 1.5),
    //     rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    // },
    //     ui.uiAssets.shapes.SQUARE_RED,
    //     ui.uiAssets.numbers[1],
    //     "1 CAT",
    //     () => {
    //         console.log("1")
    //     }
    // ))

    // gameButtons.push(new ui.MenuButton({
    //     parent: sceneParentEntity,
    //     position: Vector3.create(-2, 1, 3),
    //     scale: Vector3.create(1.5, 1.5, 1.5),
    //     rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    // },
    //     ui.uiAssets.shapes.SQUARE_RED,
    //     ui.uiAssets.numbers[2],
    //     "2 CAT",
    //     () => {
    //         console.log("2")
    //     }
    // ))
    
    // for (let i = 1; i <= 9; i++) {
    //     gameButtons.push(new ui.MenuButton({
    //         parent: sceneParentEntity,
    //         position: Vector3.create((((-i-1)/2)), 1, 3),
    //         scale: Vector3.create(1.5, 1.5, 1.5),
    //         rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    //     },
    //         ui.uiAssets.shapes.SQUARE_RED,
    //         ui.uiAssets.numbers[i],
    //         `${i} CAT`,
    //         () => {
    //             console.log(i)
    //         }
    //     ))
    // }

    gameButtons.push(new ui.MenuButton({
        parent: sceneParentEntity,
        //   position: restartButton.position,
        position: Vector3.create(1, 1, 3),

        scale: Vector3.create(1.5, 1.5, 1.5),
        rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.restart,
        "RESTART LEVEL",
        () => {
            // startNewLevel(gameState.lvl)
            console.log("Restart lvl")
        }
    ))

    gameButtons.push(new ui.MenuButton({
        parent: sceneParentEntity,
        // position: sfxButton.position,
        position: Vector3.create(2, 1, 3),

        scale: Vector3.create(1.5, 1.5, 1.5),
        rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.sound,
        'Sound FX',
        () => {
            // sfxEnable = !sfxEnable 
        }
    ))

    gameButtons.push(new ui.MenuButton({
        parent: sceneParentEntity,
        // position: exitButton.position,
        position: Vector3.create(6, 1, 3),

        scale: Vector3.create(1.5, 1.5, 1.5),
        rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    },
        ui.uiAssets.shapes.RECT_RED,
        ui.uiAssets.icons.exitText,
        'Exit from game area',
        () => {
            // exitGame() 
            console.log("Exit game")
        }
    ))

    new ui.MenuButton({
        parent: sceneParentEntity,
        // position: musicButton.position,
        position: Vector3.create(3, 1, 3),

        scale: Vector3.create(1.5, 1.5, 1.5),
        rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.music,
        'Play/Stop Music',
        () => {
            // soundManager.themePlaying(!soundManager.getThemeStatus()) 
            console.log("Sound")
        }
    )
}