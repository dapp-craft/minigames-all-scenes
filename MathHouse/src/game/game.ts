import { sceneParentEntity, ui } from "@dcl-sdk/mini-games/src"
import { initialLevels, maxLevel, soundConfig, timerConfig } from "../config"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { Animator, Billboard, engine, Entity, GltfContainer, TextShape, Transform, VisibilityComponent } from "@dcl/sdk/ecs"
import { syncEntity } from "@dcl/sdk/network"
import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'
import { GameData, gameState, progressState } from "../state"
import { movePlayerTo } from "~system/RestrictedActions"
import { gameEntityManager } from "../entityManager"
import { generateArray, rocketBoard } from ".."
import { readGltfLocators } from "../../../common/locators"
import { randomLvl } from "../levels"
import { soundManager } from "../globals"
import { fetchPlayerProgress, updatePlayerProgress } from "./syncData"

export let gameDataEntity: Entity
export let sessionStartedAt: number
export let gameButtons: ui.MenuButton[] = []

let playerAnswer = 0
let entityCounter = -1
let entityManager: gameEntityManager
let timer: ui.Timer3D

const WIN_DURATION = 2000

export const exitCallback = () => {
    soundManager.playSound('exitSounds', soundConfig.volume)
    entityManager?.stopGame()
    progressState.level = 1
    TextShape.getMutable(gameState.levelCounter).text = `Level: ${progressState.level - 1}`
    GameData.createOrReplace(gameDataEntity, {
        playerAddress: '',
        playerName: '',
        moves: 0,
        levelStartedAt: 0,
        levelFinishedAt: 0
    })
}

export const restartCallback = () => {
    entityManager?.stopGame()
    gameButtons.forEach((button, i) => button.disable())
    startGame()
}

export const initGame = async () => {
    await fetchPlayerProgress()

    initGameButtons()

    setupWinAnimations()

    await initCountdownNumbers()
}

export function getReadyToStart() {
    console.log('Get Ready to start!')
    gameButtons.forEach((button, i) => button.disable())
    countdown(() => startGame(), 3)
}

async function startGame() {
    gameButtons.forEach((button, i) => button.disable())
    const localPlayer = getPlayer()
    sessionStartedAt = Date.now()

    soundManager.playSound('enterSounds', soundConfig.volume)

    generateLevel()

    entityCounter = -1
    rocketBoard.setLeftCounter(0)
    rocketBoard.setRightCounter(randomLvl.initialEntityAmount)
    rocketBoard.showBoard(randomLvl.initialEntityAmount)

    entityManager = new gameEntityManager(randomLvl);
    entityCounter = await entityManager.startGame()

    GameData.createOrReplace(gameDataEntity, {
        playerAddress: localPlayer?.userId,
        playerName: localPlayer?.name
    })
}

const initGameButtons = async () => {
    const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    for (let i = 1; i <= 9; i++) {
        gameButtons.push(
            new ui.MenuButton(
                { position: data.get(`button_answer_${i}`)?.position, parent: sceneParentEntity, rotation: data.get(`button_answer_${i}`)?.rotation, scale: data.get(`button_answer_${i}`)?.scale },
                ui.uiAssets.shapes.SQUARE_PURPLE,
                ui.uiAssets.numbers[i],
                `${i}`,
                () => {
                    playerAnswer = i
                    gameButtons.forEach((button, i) => button.disable())
                    console.log(entityCounter, playerAnswer)
                    rocketBoard.setLeftCounter(playerAnswer)
                    rocketBoard.setRightCounter(entityCounter)
                    rocketBoard.showBoard(playerAnswer)
                    const time = playerAnswer * timerConfig.additionCatTimeGap + timerConfig.catIconAnimationTime + timerConfig.initialCatTimeGap
                    utils.timers.setTimeout(() => {
                        gameButtons[i - 1].disable()
                    }, gameButtons[i - 1].releaseTime + 200)
                    if (entityCounter == playerAnswer) {
                        console.log("WIN")
                        soundManager.playSound('correctAnswerSound', soundConfig.volume)
                        utils.timers.setTimeout(async () => {
                            startWinAnimation()
                        }, time)
                        utils.timers.setTimeout(async () => {
                            if (progressState.level >= maxLevel) return afterGame()
                            await incrementUserProgress()
                            startGame()
                        }, time + WIN_DURATION)
                    }
                    else {
                        console.log("LOSE")
                        soundManager.playSound('wrongAnswerSound', soundConfig.volume)
                        utils.timers.setTimeout(() => restartCallback(), 1500)
                    }
                },
                true,
                500
            )
        )
    }
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

const afterGame = () => {
    utils.timers.setTimeout(() => {
        movePlayerTo({
            newRelativePosition: Vector3.create(8, 1, 13),
        })
        progressState.level = 1
    }, WIN_DURATION)
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
    }, WIN_DURATION)
}

const incrementUserProgress = async () => {
    progressState.level++
    TextShape.getMutable(gameState.levelCounter).text = `Level: ${progressState.level - 1}`
    await updatePlayerProgress(progressState)
}

const generateLevel = () => {
    if (progressState.level <= 4) return generateArray(initialLevels.has(progressState.level) ? initialLevels.get(progressState.level)! : { length: 5 })
    let levelDifficulty = progressState.level + 2
    console.log("levelDifficulty: ", levelDifficulty)
    if (levelDifficulty % 2 == 0) { generateArray({ length: levelDifficulty / 2 }) }
    else { generateArray({ length: (levelDifficulty - 1) / 2 }) }
}

async function initCountdownNumbers() {
    const data = await readGltfLocators(`locators/obj_background.gltf`)
    console.log(data.get('background')?.position)
    timer = new ui.Timer3D(
        {
            parent: sceneParentEntity,
            position: { ...data.get('background')!.position, y: 3 },
            rotation: Quaternion.fromEulerDegrees(0, 0, 0),
            scale: Vector3.create(.5, .5, .5)
        },
        1,
        1,
        false,
        10
    )
    console.log(timer)
    timer.hide()
}

async function countdown(cb: () => void, number: number, stop?: boolean) {
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