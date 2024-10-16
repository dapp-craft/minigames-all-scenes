import { sceneParentEntity, ui } from "@dcl-sdk/mini-games/src"
import { initialLevels, maxLevel, soundConfig, timerConfig, WIN_DURATION } from "../config"
import { Vector3 } from "@dcl/sdk/math"
import { Entity, TextShape } from "@dcl/sdk/ecs"
import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'
import { GameData, gameState, progressState } from "../state"
import { movePlayerTo } from "~system/RestrictedActions"
import { gameEntityManager } from "../entityManager"
import { generateArray, rocketBoard } from ".."
import { readGltfLocators } from "../../../common/locators"
import { randomLvl } from "../levels"
import { soundManager } from "../globals"
import { updatePlayerProgress } from "./syncData"
import { cancelCountdown, runCountdown, runGameoverAnimation, runWinAnimation } from "../../../common/effects"

export let gameDataEntity: Entity
export let sessionStartedAt: number
export let gameButtons: ui.MenuButton[] = []
export let nextLevelTimeOut: utils.TimerId | undefined = undefined

let playerAnswer = 0
let entityCounter = -1
let entityManager: gameEntityManager

export const exitCallback = () => {
    soundManager.playSound('exitSounds', soundConfig.volume)
    cancelCountdown()
    // TODO delete setTimeout
    utils.timers.setTimeout(() => {
        entityManager.stopGame()
        rocketBoard.hideBoard()
        progressState.level = 1
        TextShape.getMutable(gameState.levelCounter).text = `Level: ${progressState.level - 1}`
        GameData.createOrReplace(gameDataEntity, {
            playerAddress: '',
            playerName: '',
            moves: 0,
            levelStartedAt: 0,
            levelFinishedAt: 0
        })
    }, 100)
}

export const restartCallback = () => {
    entityManager?.stopGame()
    gameButtons.forEach((button, i) => button.disable())
    startGame()
}

export const initGame = async () => {
    await initGameButtons()
}

export function getReadyToStart() {
    console.log('Get Ready to start!')
    gameButtons.forEach((button, i) => button.disable())
    runCountdown().then(() => startGame())
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
                    if (entityCounter == playerAnswer) {
                        console.log("WIN")
                        soundManager.playSound('correctAnswerSound', soundConfig.volume)
                        nextLevelTimeOut = utils.timers.setTimeout(async () => {
                            await incrementUserProgress()
                            if (progressState.level >= maxLevel) runGameoverAnimation(WIN_DURATION).then(() => afterGame())
                            else {
                                runWinAnimation(WIN_DURATION)
                                nextLevelTimeOut = utils.timers.setTimeout(() => startGame(), WIN_DURATION)
                            }
                        }, time)
                    }
                    else {
                        console.log("LOSE")
                        soundManager.playSound('wrongAnswerSound', soundConfig.volume)
                        nextLevelTimeOut = utils.timers.setTimeout(() => restartCallback(), time + 500)
                    }
                },
            )
        )
    }
}

const afterGame = () => {
    utils.timers.setTimeout(() => {
        movePlayerTo({newRelativePosition: Vector3.create(8, 1, 13),})
        progressState.level = 1
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