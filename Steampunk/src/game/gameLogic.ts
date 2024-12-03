import * as utils from '@dcl-sdk/utils'
import { engine, InputAction, Material, pointerEventsSystem, TextShape, Transform, VisibilityComponent } from "@dcl/sdk/ecs"
import { PlayerReturnData, steampunkGameState } from "../gameState"
import { difficultyLevel, hintsAmount, soundConfig, steampunkGameConfig } from "../gameConfig"
import { readGltfLocators } from "../../../common/locators"
import { runWinAnimation } from '../../../common/effects'
import { lightUpEntity, soundManager } from '..'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { ui } from '@dcl-sdk/mini-games/src'
import { countdown, levelButtons, timer } from './game'
import { disableCamera } from './cameraEntity'

export class GameLogic {
    private correctSmashCounter = 0
    private playerLevel = 0
    private playerDifficulty = 1
    private pictureNumber = 1
    private levelDifferenceAmmount = 0
    private differencesFound: Array<number | undefined> = []
    private hintTimeOut: utils.TimerId = 0
    private hintsAmount: number = hintsAmount[0]
    private resolveReady!: () => void
    private gameIsDone: Promise<void>
    private animationInterval: utils.TimerId = 0
    private objectDifference = new Map()
    private playerProgress: Map<number, number[]> = new Map([
        [1, []],
        [2, []],
        [3, []],
    ])
    private playerReturnData: PlayerReturnData = {
        playerStartTime: Date.now(),
        playerFinishTime: 999999999,
        playerLevel: 0,
        playerScore: 0,
    }
    private gameIsEnded = false

    constructor() {
        this.gameIsDone = new Promise((res) => { this.resolveReady = res })
    }

    public async startGame(difficulty: number = 1) {
        this.resetProgress()
        this.playerDifficulty = difficulty
        this.playGame()
        this.gameIsDone = new Promise(r => this.resolveReady = r)
        await this.gameIsDone;
        return this.playerReturnData
    }

    private startTimer() {
        engine.removeSystem('countdown-system')
        countdown(() => this.playGame(), steampunkGameConfig.gameTime / 1000)
    }

    private playMissAnimation(board: string) {
        utils.timers.clearInterval(this.animationInterval)
        const entity = steampunkGameState.listOfEntity.get('missIndicator');
        Transform.createOrReplace(entity, { ...Transform.get(steampunkGameState.listOfEntity.get(board)), position: { ...Transform.get(steampunkGameState.listOfEntity.get(board)).position, z: Transform.get(steampunkGameState.listOfEntity.get(board)).position.z + .03 }, parent: steampunkGameState.listOfEntity.get('display') })
        VisibilityComponent.getMutable(entity).visible = true
        let alpha = steampunkGameConfig.visibleFeedbackAlpha
        Material.setPbrMaterial(entity, { albedoColor: Color4.create(1, 0, 0, alpha) })
        this.animationInterval = utils.timers.setInterval(() => {
            alpha = alpha - steampunkGameConfig.visibleFeedbackSpeed
            console.log(alpha)
            Material.setPbrMaterial(entity, { albedoColor: Color4.create(1, 0, 0, alpha) })
            if (alpha >= 0) return
            VisibilityComponent.getMutable(entity).visible = false
            utils.timers.clearInterval(this.animationInterval)
        }, 100)
    }

    private resetProgress(resetGame: boolean = true) {
        if (resetGame) {
            this.playerLevel = 1
            this.pictureNumber = 1
            this.hintsAmount = hintsAmount[0]
            this.playerReturnData.playerScore = 0
            this.playerReturnData.playerLevel = 0
            this.playerReturnData.playerStartTime = Date.now()
            this.playerReturnData.playerFinishTime = 999999999
            this.playerProgress = new Map([
                [1, []],
                [2, []],
                [3, []],
            ])
        }

        for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) {
            VisibilityComponent.createOrReplace(steampunkGameState.availableEntity[i], { visible: false })
            pointerEventsSystem.removeOnPointerDown(steampunkGameState.availableEntity[i])
            Transform.createOrReplace(steampunkGameState.availableEntity[i], {
                position: Vector3.Zero(),
                scale: Vector3.Zero()
            })
        }
        this.gameIsEnded = false
        // for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) VisibilityComponent.createOrReplace(steampunkGameState.availableEntity[i], { visible: false })
        this.hintsAmount = hintsAmount[this.playerLevel - 1]
        VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("hitZone")).visible = false
        this.correctSmashCounter = 0
        // TextShape.getMutable(steampunkGameState.listOfEntity.get('hits')).text = `Score \n${this.correctSmashCounter}`
        this.differencesFound = []
        utils.timers.clearInterval(this.hintTimeOut)
        console.log(this.playerLevel, this.pictureNumber, this.correctSmashCounter, this.differencesFound)
    }

    private async playGame() {
        if (this.gameIsEnded) return
        this.playerLevelHandler()
        await this.generateDifference()
        this.resetProgress(false)
        this.startTimer()
        console.log("Player Difficulty, Level: ", this.playerDifficulty, this.playerLevel)
        const data = await readGltfLocators(`locators/locators_level_${this.playerLevel}.gltf`)
        TextShape.getMutable(steampunkGameState.listOfEntity.get('findCounter')).text = `Find \n ${this.correctSmashCounter}/${this.levelDifferenceAmmount}`
        lightUpEntity(steampunkGameState.listOfEntity.get('firstBoard'), `images/mapBackground.png`)
        lightUpEntity(steampunkGameState.listOfEntity.get('secondBoard'), `images/mapBackground.png`)
        this.updateActiveLevelButtonColor()
        for (let i = 0; i < (data.size * 2); i++) {
            pointerEventsSystem.onPointerDown(
                {
                    entity: steampunkGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
                    console.log(i, this.levelDifferenceAmmount)
                    const secondBoard = i > data.size - 1 ? false : true
                    if (this.objectDifference.get(i).isCorrect && this.objectDifference.get(secondBoard ? i + data.size : i - data.size).isCorrect) {
                        this.playMissAnimation(secondBoard ? 'firstBoard' : 'secondBoard');
                        this.changeCounter(false)
                        return soundManager.playSound('incorrect', soundConfig.volume)
                    }
                    this.objectDifference.get(i).isCorrect = true
                    this.objectDifference.get(secondBoard ? i + data.size : i - data.size).isCorrect = true
                    soundManager.playSound('correct', soundConfig.volume)
                    const objectDifferenceData = this.objectDifference.get(i)
                    lightUpEntity(steampunkGameState.availableEntity[i], `images/${objectDifferenceData.type}/${objectDifferenceData.imageNumber}.png`)
                    lightUpEntity(steampunkGameState.availableEntity[secondBoard ? i + data.size : i - data.size], `images/${objectDifferenceData.type}/${objectDifferenceData.imageNumber}.png`)
                    this.visibleFeedback(true, i)
                    utils.timers.clearInterval(this.hintTimeOut)
                    // VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("hitZone")).visible = false
                    this.differencesFound[i] = i
                    this.changeCounter()
                    if (this.correctSmashCounter < this.levelDifferenceAmmount) return
                    this.playerProgress.get(this.playerDifficulty)?.push(this.playerLevel)
                    engine.removeSystem('countdown-system')
                    runWinAnimation(steampunkGameConfig.winAnimationDuration).then(() => {
                        this.playerReturnData.playerLevel++
                        this.playerLevel++;
                        this.playGame()
                    })
                }
            )
        }
        const placeObjects = (secondBoard: boolean) => {
            for (let i = secondBoard ? data.size : 0; i < (secondBoard ? data.size * 2 : data.size); i++) {
                VisibilityComponent.createOrReplace(steampunkGameState.availableEntity[i], { visible: true })
                Transform.createOrReplace(steampunkGameState.availableEntity[i], {
                    ...data.get(`obj_difference_${secondBoard ? i - data.size + 1 : i + 1}`),
                    parent: steampunkGameState.listOfEntity.get(secondBoard ? "secondBoard" : "firstBoard")
                })
                // console.log(Transform.get(steampunkGameState.availableEntity[i]));
                lightUpEntity(steampunkGameState.availableEntity[i], `images/${this.objectDifference.get(i).type}${(!this.objectDifference.get(i)?.isCorrect) ? '_alt' : ''}/${this.objectDifference.get(i).imageNumber}.png`)
            }
        }
        placeObjects(false)
        placeObjects(true)
    }

    private playerLevelHandler() {
        console.log("Player Level Handler in ACTION")
        const findRandomDifferentNumber = (arr1: number[], arr2: number[]) => {
            const differentNumbers1 = arr1.filter(num => !arr2.includes(num));
            const differentNumbers2 = arr2.filter(num => !arr1.includes(num));
            const allDifferentNumbers = [...differentNumbers1, ...differentNumbers2];
            if (allDifferentNumbers.length > 0) {
                console.log("GENERATION", differentNumbers1, differentNumbers2, allDifferentNumbers,)
                let test = allDifferentNumbers[Math.floor(Math.random() * allDifferentNumbers.length)]
                console.log(test)
                return test
            }
            return this.playerProgress.get(this.playerDifficulty)!.length;
        }
        if (this.playerDifficulty == 0) { this.playerDifficulty = 1 }
        console.log("YO2: ", this.playerDifficulty)
        if (difficultyLevel.get(this.playerDifficulty)!.length == this.playerProgress.get(this.playerDifficulty)!.length) {
            if (this.playerDifficulty == difficultyLevel.size) {
                this.playerProgress.get(this.playerDifficulty)!.splice(0, this.playerProgress.get(this.playerDifficulty)!.length)
            } else {
                this.playerDifficulty++
            }
            console.log("YO: ", this.playerDifficulty)
        }
        this.playerLevel = findRandomDifferentNumber(difficultyLevel.get(this.playerDifficulty)!, this.playerProgress.get(this.playerDifficulty)!)
    }

    private async generateDifference() {
        console.log("generateDifference in ACTION")
        this.objectDifference.clear()
        // TODO REFACTOR
        const boardLocators = await readGltfLocators(`locators/locators_level_${this.playerLevel}.gltf`)
        this.levelDifferenceAmmount = Math.ceil(boardLocators.size * steampunkGameConfig.differentsObjectsPercentages)
        const getRandomNumbers = () => {
            const result = [];
            for (let i = 0; i < this.levelDifferenceAmmount; i++) {
                let random;
                do { random = Math.floor(Math.random() * boardLocators.size) + 1 }
                while (result[random] !== undefined)
                result[random] = random;
            }
            return result
        }
        const differenceId = getRandomNumbers()
        // console.log(differenceId)
        function generateUniqueArray(): number[] { return Array.from({ length: steampunkGameConfig.maximumTexturePerType }, (_, i) => i + 1).sort(() => Math.random() - 0.5); }
        let typeCounter: Map<string, any> = new Map([
            ['circle', { randomArray: [], index: 0 }],
            ['vertical', { randomArray: [], index: 0 }],
            ['horizontal', { randomArray: [], index: 0 }],
        ])
        typeCounter.forEach((_, key) => typeCounter.get(key).randomArray = generateUniqueArray())

        const typeHandler = (i: number) => {
            this.objectDifference.get(i).imageNumber = typeCounter.get(this.objectDifference.get(i).type).randomArray[typeCounter.get(this.objectDifference.get(i).type).index]
            this.objectDifference.get(i + boardLocators.size).imageNumber = typeCounter.get(this.objectDifference.get(i).type).randomArray[typeCounter.get(this.objectDifference.get(i).type).index]
            typeCounter.get(this.objectDifference.get(i).type).index++
        }
        for (let i = 0; i <= (boardLocators.size - 1); i++) {
            const transform = boardLocators.get(`obj_difference_${i + 1}`)
            let isCorrect = differenceId[i + 1] == i + 1 ? false : true
            let type = "circle"
            if (transform!.scale.x - transform!.scale.y <= -0.05) type = "vertical"
            else if (transform!.scale.x - transform!.scale.y >= 0.05) type = "horizontal"
            const test = [true, false]
            const randomBinary = Math.floor(Math.random() * 2);
            this.objectDifference.set(i, { transform, isCorrect: isCorrect ? isCorrect : test[randomBinary], type, imageNumber: 1 })
            this.objectDifference.set(i + boardLocators.size, { transform, isCorrect: isCorrect ? isCorrect : !test[randomBinary], type, imageNumber: 1 })
            typeHandler(i)
        }
        // console.log(boardLocators.size)
        // this.objectDifference.forEach((e, key) => console.log(key, e))
    }

    private changeCounter(correct: boolean = true) {
        if (correct) {
            this.correctSmashCounter++
            TextShape.getMutable(steampunkGameState.listOfEntity.get('findCounter')).text = `Find \n ${this.correctSmashCounter}/${this.levelDifferenceAmmount}`
            this.playerReturnData.playerScore = this.playerReturnData.playerScore + steampunkGameConfig.awardMultiplier
        } else this.playerReturnData.playerScore = this.playerReturnData.playerScore - steampunkGameConfig.awardMultiplier
        TextShape.getMutable(steampunkGameState.listOfEntity.get('hits')).text = `Score \n${this.playerReturnData.playerScore}`
        console.log("Score: ", this.correctSmashCounter, "Return Score: ", this.playerReturnData.playerScore)
    }

    private visibleFeedback(isEntityCorrect: boolean, entityId: number) {
        let alpha = steampunkGameConfig.visibleFeedbackAlpha
        VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("visibleFeedback")).visible = true
        Transform.createOrReplace(steampunkGameState.listOfEntity.get("visibleFeedback"), {
            ...Transform.getMutable(steampunkGameState.availableEntity[entityId]),
            position: { ...Transform.getMutable(steampunkGameState.availableEntity[entityId]).position, z: Transform.getMutable(steampunkGameState.availableEntity[entityId]).position.z + .01 },
        })
        const interval = utils.timers.setInterval(() => {
            alpha = alpha - steampunkGameConfig.visibleFeedbackSpeed
            Material.setPbrMaterial(steampunkGameState.listOfEntity.get("visibleFeedback"), { albedoColor: isEntityCorrect ? Color4.create(0, 1, 0, alpha) : Color4.create(1, 0, 0, alpha) })
            if (alpha >= 0) return
            VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("visibleFeedback")).visible = false
            utils.timers.clearInterval(interval)
        }, 10)
    }

    public gameEnd() {
        this.gameIsEnded = true
        disableCamera()
        engine.removeSystem('countdown-system')
        for (let i = 0; i <= steampunkGameConfig.targetEntityAmount; i++) {
            VisibilityComponent.createOrReplace(steampunkGameState.availableEntity[i], { visible: false })
            pointerEventsSystem.removeOnPointerDown(steampunkGameState.availableEntity[i])
        }
        this.playerReturnData.playerFinishTime = Date.now()
        timer.hide();
        this.resolveReady()
        Material.setPbrMaterial(steampunkGameState.listOfEntity.get('firstBoard'), { texture: Material.Texture.Common({ src: `images/scene-thumbnail.png` }) })
        Material.setPbrMaterial(steampunkGameState.listOfEntity.get('secondBoard'), { texture: Material.Texture.Common({ src: `images/scene-thumbnail.png` }) })
        TextShape.getMutable(steampunkGameState.listOfEntity.get('findCounter')).text = `Find \n0/0`
        TextShape.getMutable(steampunkGameState.listOfEntity.get('hits')).text = `Score \n0`
        levelButtons[this.playerDifficulty - 1].buttonShapeEnabled = ui.uiAssets.shapes.SQUARE_GREEN
        levelButtons[this.playerDifficulty - 1].enable()
        lightUpEntity(steampunkGameState.listOfEntity.get('firstBoard'), `images/scene-thumbnail.png`)
        lightUpEntity(steampunkGameState.listOfEntity.get('secondBoard'), `images/scene-thumbnail.png`)
    }

    private updateActiveLevelButtonColor() {
        levelButtons.forEach((button, i) => {
            button.buttonShapeEnabled = this.playerDifficulty === i + 1 ? ui.uiAssets.shapes.SQUARE_YELLOW : ui.uiAssets.shapes.SQUARE_GREEN
            if (button.enabled) button.enable()
        })
    }
}
