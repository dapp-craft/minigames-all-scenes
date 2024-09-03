import { progress, queue, sceneParentEntity, ui } from "@dcl-sdk/mini-games/src"
import { entityAmount, entityConfig, mainEntityId, MAX_LEVEL } from "../config"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { engine, Entity, GltfContainer, TextShape, Transform, VisibilityComponent } from "@dcl/sdk/ecs"
import { syncEntity } from "@dcl/sdk/network"
import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'
import { GameData, gameState } from "../state"
import { movePlayerTo } from "~system/RestrictedActions"
import { gameEntityManager } from "../entityManager"
import { lvl0 } from "../leavels"
import { kitty } from "../resources/resources"

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

    gameButtons.forEach((button, i) => button.disable())

    entityCounter = -1
    initialEntity(lvl0.initialEntityAmount)
    const entityManager = new gameEntityManager(lvl0);
    entityCounter = await entityManager.startGame()

    gameButtons.forEach((button, i) => button.enable())

    GameData.createOrReplace(gameDataEntity, {
        playerAddress: localPlayer?.userId,
        playerName: localPlayer?.name
    })

    // console.log('Max progress', maxProgress)
    // const levelToStart = maxProgress?.level ? Math.min(maxProgress?.level + 1, MAX_LEVEL) : 1
    // console.log('Starting level', levelToStart)

    // gameButtons.forEach((button, i) => {
    //     if (i <= MAX_LEVEL - 1) {
    //         if (i < maxProgress?.level + 1 || i == 0) {
    //             button.enable()
    //         } else {
    //             button.disable()
    //         }
    //     } else {
    //         button.enable()
    //     }
    // })
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
                position: Vector3.create(0, 1, 3),
                scale: Vector3.create(1.5, 1.5, 1.5),
                rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
            },
            ui.uiAssets.shapes.SQUARE_GREEN,
            ui.uiAssets.icons.play,
            `START LEVEL 1`,
            async () => {
                queue.addPlayer()
            }
        )
    )

    gameButtons.push(new ui.MenuButton({
        parent: sceneParentEntity,
        position: Vector3.create(-1, 1, 3),
        scale: Vector3.create(1.5, 1.5, 1.5),
        rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.leftArrow,
        "1 CAT",
        () => {
            playerAnswer--
        }
    ))

    gameButtons.push(new ui.MenuButton({
        parent: sceneParentEntity,
        position: Vector3.create(-3, 1, 3),
        scale: Vector3.create(1.5, 1.5, 1.5),
        rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
    },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.rightArrow,
        "2 CAT",
        () => {
            playerAnswer++
        }
    ))

    gameButtons.push(new ui.MenuButton({
        parent: sceneParentEntity,
        position: Vector3.create(-4, 1, 3),
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
                initialEntity(entityCounter)
            }
            else console.log("LOSE")
        }
    ))

    const sign = engine.addEntity()

    Transform.create(sign, {
        position: Vector3.create(6, 1, 11),
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
    let x = 0
    let y = 0
        
    gameState.entityInRoket.forEach(entity => {
        VisibilityComponent.createOrReplace(entity, { visible: false })
    })
    for (let i = 0; i < count; i++) {
        const entity = gameState.entityInRoket[i]
        VisibilityComponent.createOrReplace(entity, { visible: true })
        GltfContainer.createOrReplace(entity, { src: kitty.src })
        Transform.createOrReplace(entity, {
            parent: gameState.rocketWindow!,
            position: Vector3.create((x - 2) * entityConfig.spacing, (y - 2) * entityConfig.spacing, +.2),
            scale: Vector3.create(entityConfig.initialEntitySize, entityConfig.initialEntitySize, entityConfig.initialEntitySize)
        })
        x++
        if (x * (Math.abs(entityConfig.initialEntitySize) + Math.abs(entityConfig.spacing)) > entityConfig.maxRowLength) {
            x = 0
            y++
        }
    }
}