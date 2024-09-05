import { progress, queue, sceneParentEntity, ui } from "@dcl-sdk/mini-games/src"
import { mainEntityId } from "../config"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { Animator, Billboard, engine, Entity, GltfContainer, TextShape, Transform, VisibilityComponent } from "@dcl/sdk/ecs"
import { parentEntity, syncEntity } from "@dcl/sdk/network"
import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'
import { GameData, gameState, rocketCoords } from "../state"
import { movePlayerTo } from "~system/RestrictedActions"
import { gameEntityManager } from "../entityManager"
import { lvl0 } from "../leavels"
import { rocketBoard } from ".."
import { readGltfLocators } from "../../../common/locators"

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

    setupWinAnimations()

    queue.listeners.onActivePlayerChange = (player) => {
        const localPlayer = getPlayer()
        if (player?.address === localPlayer?.userId) {
            getReadyToStart()
        } else {
            entityManager?.stopGame()
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
    // startWinAnimation()
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

const initGameButtons = async () => {
    const data = await readGltfLocators(`locators/obj_buttons.gltf`)

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
                queue.addPlayer()
            }
        )
    )

    for (let i = 1; i <= 9; i++) {
        gameButtons.push(
            new ui.MenuButton(
                { position: data.get(`level0${i}`)?.position, parent: sceneParentEntity, rotation: Quaternion.create(0, -2, -1, 0) },
                ui.uiAssets.shapes.SQUARE_RED,
                ui.uiAssets.numbers[i],
                `${i}`,
                () => {
                    playerAnswer = i
                    console.log(entityCounter, playerAnswer)
                    rocketBoard.showBoard(playerAnswer)
                    if (entityCounter == playerAnswer) {
                        console.log("WIN WIN WIN WIN WIN")
                        startWinAnimation()
                    }
                    else {
                        console.log("LOSE")
                        utils.timers.setTimeout(async () => {
                            rocketBoard.hideBoard()
                        }, 1500)
                    }
                }
            )
        )
    }

    new ui.MenuButton(
        { position: data.get(`restart`)?.position, parent: sceneParentEntity, rotation: Quaternion.create(0, -2, -1, 0) },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.restart,
        `RESTART`,
        () => {
            console.log("Yo")
            entityManager?.stopGame()
            // entityManager?.startGame()
            getReadyToStart()
            // entityManager.start()
        }
    )

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

function setupWinAnimations() {
    let winAnimA = engine.addEntity()
    let winAnimB = engine.addEntity()
    let winAnimC = engine.addEntity()
    let winAnimFollow = engine.addEntity()
    let winAnimText = engine.addEntity()

    GltfContainer.create(winAnimA, {
        src: "mini-game-assets/models/winAnim.glb",

    })

    Transform.create(winAnimA, {
        parent: sceneParentEntity,
        position: Vector3.create(0, 3, -6),
        scale: Vector3.create(1, 1, 1),
        rotation: Quaternion.fromEulerDegrees(0, 45, 0)
    })

    Animator.create(winAnimA, {
        states: [
            {
                clip: 'armature_psAction',
                playing: false,
                loop: false
            }
        ]
    })

    GltfContainer.create(winAnimB, {
        src: "mini-game-assets/models/winAnim.glb"

    })

    Transform.create(winAnimB, {
        parent: sceneParentEntity,
        position: Vector3.create(0, 3, -6),
        scale: Vector3.create(1, 1, 1),
        rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })

    Animator.create(winAnimB, {
        states: [
            {
                clip: 'armature_psAction',
                playing: false,
                loop: false
            }
        ]
    })

    GltfContainer.create(winAnimC, {
        src: "mini-game-assets/models/winAnim.glb"
    })

    Transform.create(winAnimC, {
        parent: sceneParentEntity,
        position: Vector3.create(0, 3, -6),
        scale: Vector3.create(1, 1, 1),
        rotation: Quaternion.fromEulerDegrees(0, -45, 0)
    })

    Animator.create(winAnimC, {
        states: [
            {
                clip: 'armature_psAction',
                playing: false,
                loop: false
            }
        ]
    })

    GltfContainer.create(winAnimFollow, {
        src: "mini-game-assets/models/winAnimFollow.glb"
    })

    Transform.create(winAnimFollow, {
        parent: sceneParentEntity,
        position: Vector3.create(0, 3, -6),
        scale: Vector3.create(0.3, 0.3, 0.3),
        rotation: Quaternion.fromEulerDegrees(0, -90, 0)
    })
    Billboard.create(winAnimFollow, {})

    Animator.create(winAnimFollow, {
        states: [
            {
                clip: 'RaysAnim',
                playing: false,
                loop: false
            }
        ]
    })

    GltfContainer.create(winAnimText, {
        src: "mini-game-assets/models/winAnimText.glb"
    })

    Animator.create(winAnimText, {
        states: [
            {
                clip: 'Animation',
                playing: false,
                loop: false
            }
        ]
    })

    Transform.create(winAnimText, {
        parent: sceneParentEntity,
        position: Vector3.create(0, 3, -3),
        scale: Vector3.create(0.8, 0.8, 0.8),
        rotation: Quaternion.fromEulerDegrees(0, -90, 0)
    })
    Billboard.create(winAnimText, {})

    VisibilityComponent.create(winAnimA, { visible: false })
    VisibilityComponent.create(winAnimB, { visible: false })
    VisibilityComponent.create(winAnimC, { visible: false })
    VisibilityComponent.create(winAnimFollow, { visible: false })
    VisibilityComponent.create(winAnimText, { visible: false })

    syncEntity(winAnimA, [VisibilityComponent.componentId, Animator.componentId])
    syncEntity(winAnimB, [VisibilityComponent.componentId, Animator.componentId])
    syncEntity(winAnimC, [VisibilityComponent.componentId, Animator.componentId])
    syncEntity(winAnimFollow, [VisibilityComponent.componentId, Animator.componentId])
    syncEntity(winAnimText, [VisibilityComponent.componentId, Animator.componentId])
}

function startWinAnimation() {
    const animations = engine.getEntitiesWith(Animator, VisibilityComponent)
    for (const [entity] of animations) {
        VisibilityComponent.getMutable(entity).visible = true
        Animator.getMutable(entity).states[0].playing = true
    }

    utils.timers.setTimeout(() => {

        const animations = engine.getEntitiesWith(Animator, VisibilityComponent)
        for (const [entity] of animations) {
            VisibilityComponent.getMutable(entity).visible = false
        }
    }, 8000)
}