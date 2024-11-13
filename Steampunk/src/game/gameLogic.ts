import * as utils from '@dcl-sdk/utils'
import { ColliderLayer, GltfContainer, InputAction, Material, PBGltfContainer, pointerEventsSystem, TextShape, TextureFilterMode, TextureWrapMode, Transform, VisibilityComponent } from "@dcl/sdk/ecs"
import { correctTargetAmount, steampunkGameState } from "../gameState"
import { hintsAmount, levelAmount, steampunkGameConfig } from "../gameConfig"
import { readGltfLocators } from "../../../common/locators"
import { runWinAnimation } from '../../../common/effects'
import { soundManager } from '..'
import { Color4 } from '@dcl/sdk/math'

export class GameLogic {
    private correctSmashCounter = 0
    private playerLevel = 1
    private pictureNumber = 1
    private differencesFound: Array<number | undefined> = []
    private hintTimeOut: utils.TimerId = 0
    private hintsAmount: number = hintsAmount[0]
    private resolveReady!: () => void
    private gameIsDone: Promise<void>
    private playerReturnData = {
        playerScore: 0,
        playerTime: undefined
    }

    constructor() {
        this.gameIsDone = new Promise((res) => { this.resolveReady = res })
    }

    public async startGame(level: number = 1) {
        this.resetProgress()
        this.playerLevel = level
        this.playGame()
        this.gameIsDone = new Promise(r => this.resolveReady = r)
        await this.gameIsDone;
        return this.playerReturnData
    }

    private resetProgress(resetGame: boolean = true) {
        if (resetGame) {
            this.playerLevel = 1
            this.pictureNumber = 1
            this.hintsAmount = hintsAmount[0]
        }
        for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) VisibilityComponent.createOrReplace(steampunkGameState.availableEntity[i], { visible: false })
        this.hintsAmount = hintsAmount[this.playerLevel - 1]
        VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("hitZone")).visible = false
        this.correctSmashCounter = 0
        TextShape.getMutable(steampunkGameState.listOfEntity.get('hits')).text = `Hits \n${this.correctSmashCounter}`
        this.differencesFound = []
        utils.timers.clearInterval(this.hintTimeOut)
        console.log(this.playerLevel, this.pictureNumber, this.correctSmashCounter, this.differencesFound)
    }

    private async playGame() {
        this.resetProgress(false)
        const data = await readGltfLocators(`locators/obj_locators_unique1.gltf`)
        Material.setPbrMaterial(steampunkGameState.listOfEntity.get('firstBoard'), { texture: Material.Texture.Common({ src: `images/level${this.playerLevel}_${this.pictureNumber}.png` }) })
        Material.setPbrMaterial(steampunkGameState.listOfEntity.get('secondBoard'), { texture: Material.Texture.Common({ src: `images/level${this.playerLevel}_${this.pictureNumber + 1}.png` }) })
        for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) {
            const path: PBGltfContainer = { src: `models/target${this.playerLevel}_${i + 1}/target${this.playerLevel}_${i + 1}.gltf` };
            GltfContainer.createOrReplace(steampunkGameState.availableEntity[i], {
                ...path,
                invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
                visibleMeshesCollisionMask: ColliderLayer.CL_POINTER
            })
            Transform.createOrReplace(steampunkGameState.availableEntity[i], { ...data.get(`target${this.playerLevel}_${i + 1}`), parent: steampunkGameState.listOfEntity.get('display') })
            pointerEventsSystem.onPointerDown(
                {
                    entity: steampunkGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
                    console.log(i, correctTargetAmount[this.playerLevel])
                    if (i > correctTargetAmount[this.playerLevel - 1]) {
                        this.visibleFeedback(false, i)
                        return soundManager.playSound('incorrect')
                    }
                    soundManager.playSound('correct')
                    this.visibleFeedback(true, i)
                    utils.timers.clearInterval(this.hintTimeOut)
                    VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("hitZone")).visible = false
                    this.differencesFound[i] = i
                    pointerEventsSystem.removeOnPointerDown(steampunkGameState.availableEntity[i])
                    this.changeCounter()
                    if (this.correctSmashCounter < 5) return
                    runWinAnimation(steampunkGameConfig.winAnimationDuration).then(() => {
                        this.playerLevel++
                        if (this.playerLevel > levelAmount) return this.gameEnd()
                        this.playGame()
                    })
                }
            )
        }
    }

    private changeCounter() {
        this.correctSmashCounter++
        this.playerReturnData.playerScore = this.correctSmashCounter * steampunkGameConfig.awardMultiplier
        TextShape.getMutable(steampunkGameState.listOfEntity.get('hits')).text = `Hits \n${this.playerReturnData.playerScore}`
        console.log(this.playerLevel)
    }

    // TODO: circle looks not finished
    private visibleFeedback(isEntityCorrect: boolean, entityId: number) {
        let alpha = steampunkGameConfig.visibleFeedbackAlpha
        VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("visibleFeedback")).visible = true
        Transform.getMutable(steampunkGameState.listOfEntity.get("visibleFeedback")).position = Transform.get(steampunkGameState.availableEntity[entityId]).position
        const interval = utils.timers.setInterval(() => {
            alpha = alpha - steampunkGameConfig.visibleFeedbackSpeed
            console.log(alpha)
            Material.setPbrMaterial(steampunkGameState.listOfEntity.get("visibleFeedback"), { albedoColor: isEntityCorrect ? Color4.create(0, 1, 0, alpha) : Color4.create(1, 0, 0, alpha) })
            if (alpha >= 0) return
            VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("visibleFeedback")).visible = false
            utils.timers.clearInterval(interval)
        }, 10)
    }

    public getHint() {
        if (this.hintsAmount <= 0) { return console.log("No available hints") }
        let hintEntityId = undefined
        for (let i = 0; i < correctTargetAmount[this.playerLevel - 1]; i++) {
            if (this.differencesFound[i] == undefined) {
                hintEntityId = i
                break
            }
        }
        if (hintEntityId == undefined) return
        this.hintsAmount--
        let hintShowCounter = 0
        this.hintTimeOut = utils.timers.setInterval(() => {
            Transform.getMutable(steampunkGameState.listOfEntity.get("hitZone")).position = Transform.get(steampunkGameState.availableEntity[hintEntityId]).position
            VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("hitZone")).visible = !VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("hitZone")).visible
            hintShowCounter++
            if (hintShowCounter < steampunkGameConfig.hintShowTimes * 2) return
            VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("hitZone")).visible = false
            utils.timers.clearInterval(this.hintTimeOut)
        }, steampunkGameConfig.hintDelay)
    }

    public gameEnd() {
        this.resolveReady()
    }
}
