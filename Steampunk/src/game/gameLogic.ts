import * as utils from '@dcl-sdk/utils'
import { ColliderLayer, engine, Entity, GltfContainer, InputAction, Material, MaterialTransparencyMode, MeshCollider, MeshRenderer, PBGltfContainer, pointerEventsSystem, TextShape, TextureFilterMode, TextureWrapMode, Transform, VisibilityComponent } from "@dcl/sdk/ecs"
import { PlayerReturnData, steampunkGameState } from "../gameState"
import { correctTargetAmount, hintsAmount, levelAmount, steampunkGameConfig } from "../gameConfig"
import { readGltfLocators } from "../../../common/locators"
import { runWinAnimation } from '../../../common/effects'
import { soundManager } from '..'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { queue, sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { countdown, timer } from './game'

export class GameLogic {
    private correctSmashCounter = 0
    private playerLevel = 1
    private pictureNumber = 1
    private differencesFound: Array<number | undefined> = []
    private hintTimeOut: utils.TimerId = 0
    private hintsAmount: number = hintsAmount[0]
    private resolveReady!: () => void
    private gameIsDone: Promise<void>
    private animationInterval: utils.TimerId = 0
    private objectDifference = new Map()
    private playerReturnData: PlayerReturnData = {
        playerStartTime: Date.now(),
        playerFinishTime: 999999999,
        playerLevel: [],
        playerScore: 0,
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
            this.playerReturnData.playerLevel = []
            this.playerReturnData.playerStartTime = Date.now()
            this.playerReturnData.playerFinishTime = 999999999
        }
        // for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) VisibilityComponent.createOrReplace(steampunkGameState.availableEntity[i], { visible: false })
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
        this.startTimer()
        this.generateDifference()
        console.log("Player level: ", this.playerLevel)
        TextShape.getMutable(steampunkGameState.listOfEntity.get('findCounter')).text = `Find \n ${this.correctSmashCounter}/${correctTargetAmount[this.playerLevel - 1]}`
        const data = await readGltfLocators(`locators/locators_level_${this.playerLevel}.gltf`)
        Material.setPbrMaterial(steampunkGameState.listOfEntity.get('firstBoard'), { texture: Material.Texture.Common({ src: `images/mapBackground.png` }) })
        Material.setPbrMaterial(steampunkGameState.listOfEntity.get('secondBoard'), { texture: Material.Texture.Common({ src: `images/mapBackground.png` }) })
        for (let i = 0; i < steampunkGameConfig.targetEntityAmount + 3; i++) {
            pointerEventsSystem.onPointerDown(
                {
                    entity: steampunkGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
                    console.log(i, correctTargetAmount[this.playerLevel])
                    const secondBoard = i < data.size / 2 ? false : true
                    if (this.objectDifference.get(i).isCorrect) {
                        this.playMissAnimation(secondBoard ? 'firstBoard' : 'secondBoard');
                        this.changeCounter(false)
                        return soundManager.playSound('incorrect')
                    }
                    this.objectDifference.get(i).isCorrect = true
                    this.objectDifference.get(!secondBoard ? i + data.size / 2 : i - data.size / 2).isCorrect = true
                    soundManager.playSound('correct')
                    const objectDifferenceData = this.objectDifference.get(i)

                    const leftBoardEntity = Material.getMutable(steampunkGameState.availableEntity[i]).material
                    if (leftBoardEntity?.$case === "pbr" && leftBoardEntity.pbr.texture?.tex?.$case === 'texture') { leftBoardEntity.pbr.texture.tex.texture.src = `images/${objectDifferenceData.type}/${objectDifferenceData.imageNumber}.png` }

                    const rightBoardEntity = Material.getMutable(steampunkGameState.availableEntity[!secondBoard ? i + data.size / 2 : i - data.size / 2]).material
                    if (rightBoardEntity?.$case === "pbr" && rightBoardEntity.pbr.texture?.tex?.$case === 'texture') { rightBoardEntity.pbr.texture.tex.texture.src = `images/${this.objectDifference.get(i).type}/${objectDifferenceData.imageNumber}.png` }

                    // Material.setPbrMaterial(steampunkGameState.availableEntity[i], {
                    //     texture: Material.Texture.Common({
                    //         src: `images/${objectDifferenceData.type}/${objectDifferenceData.imageNumber}.png`,
                    //     }),
                    //     transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
                    // })
                    // Material.setPbrMaterial(steampunkGameState.availableEntity[!secondBoard ? i + data.size / 2 : i - data.size / 2], {
                    //     texture: Material.Texture.Common({
                    //         src: `images/${this.objectDifference.get(i).type}/${objectDifferenceData.imageNumber}.png`,
                    //     }),
                    //     transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
                    // })

                    this.visibleFeedback(true, i)
                    utils.timers.clearInterval(this.hintTimeOut)
                    VisibilityComponent.getMutable(steampunkGameState.listOfEntity.get("hitZone")).visible = false
                    this.differencesFound[i] = i
                    this.changeCounter()
                    if (this.correctSmashCounter < correctTargetAmount[this.playerLevel - 1]) return
                    engine.removeSystem('countdown-system')
                    runWinAnimation(steampunkGameConfig.winAnimationDuration).then(() => {
                        this.playerReturnData.playerLevel[this.playerLevel - 1] = this.playerLevel
                        this.playerLevel++
                        if (this.playerLevel > levelAmount) return this.gameEnd()
                        this.playGame()
                    })
                }
            )
        }
        for (let i = 0; i < data.size; i++) {
            const secondBoard = i < data.size / 2 ? false : true
            let iterator = secondBoard ? i - data.size / 2 : i
            MeshRenderer.setPlane(steampunkGameState.availableEntity[i])
            MeshCollider.setPlane(steampunkGameState.availableEntity[i])
            Transform.createOrReplace(steampunkGameState.availableEntity[i], {
                ...data.get(`obj_difference${secondBoard ? '1' : '2'}_${iterator + 1}`),
                parent: sceneParentEntity
            })
            this.objectDifference.get(iterator)
            // Material.setPbrMaterial(steampunkGameState.availableEntity[i], {
            //     texture: Material.Texture.Common({
            //         src: `images/${this.objectDifference.get(iterator).type}${(!this.objectDifference.get(iterator)?.isCorrect && secondBoard) ? '_alt' : ''}/${this.objectDifference.get(iterator).imageNumber}.png`,
            //         wrapMode: TextureWrapMode.TWM_CLAMP,
            //     }),
            //     transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
            // })
            // TODO REFACTOR
            Material.createOrReplace(steampunkGameState.availableEntity[i], {
                material: {
                    $case: 'pbr',
                    pbr: {
                        texture: {
                            tex: {
                                $case: 'texture',
                                texture: { src: `images/${this.objectDifference.get(iterator).type}${(!this.objectDifference.get(iterator)?.isCorrect && secondBoard) ? '_alt' : ''}/${this.objectDifference.get(iterator).imageNumber}.png`, filterMode: TextureFilterMode.TFM_TRILINEAR }
                            }
                        },
                        alphaTexture: {
                            tex: {
                                $case: 'texture',
                                texture: {
                                    src: 'images/alpha/alpha_screen.png',
                                    filterMode: TextureFilterMode.TFM_TRILINEAR,
                                    wrapMode: TextureWrapMode.TWM_REPEAT
                                }
                            }
                        },
                        emissiveColor: Color4.White(),
                        emissiveIntensity: 0.9,
                        emissiveTexture: {
                            tex: {
                                $case: 'texture',
                                texture: { src: `images/${this.objectDifference.get(iterator).type}${(!this.objectDifference.get(iterator)?.isCorrect && secondBoard) ? '_alt' : ''}/${this.objectDifference.get(iterator).imageNumber}.png`, filterMode: TextureFilterMode.TFM_TRILINEAR }
                            }
                        },
                        roughness: 1.0,
                        specularIntensity: 0,
                        metallic: 0,
                        transparencyMode: MaterialTransparencyMode.MTM_AUTO
                    }
                }
            })
        }
    }

    private async generateDifference() {
        console.log("generateDifference in ACTION")
        // TODO REFACTOR
        const boardLocators = await readGltfLocators(`locators/locators_level_${this.playerLevel}.gltf`)
        const getRandomNumbers = () => {
            const result = [];
            for (let i = 0; i < correctTargetAmount[this.playerLevel - 1]; i++) {
                let random;
                do { random = Math.floor(Math.random() * boardLocators.size / 2) + 1 }
                while (result[random] !== undefined)
                result[random] = random
            }
            return result
        }
        const differenceId = getRandomNumbers()
        // console.log(differenceId)
        function generateUniqueArray(): number[] {return Array.from({ length: steampunkGameConfig.maximumTexturePerType }, (_, i) => i + 1).sort(() => Math.random() - 0.5);}
        let typeCounter: Map<string, any> = new Map([
            ['circle', {randomArray: [], index: 0}],
            ['vertical', {randomArray: [], index: 0}],
            ['horizontal', {randomArray: [], index: 0}],
        ])
        typeCounter.forEach((_, key) => typeCounter.get(key).randomArray = generateUniqueArray())

        const typeHandler = (i: number) => {
            console.log(typeCounter.get(this.objectDifference.get(i).type));
            console.log(this.objectDifference.get(i).type)
            this.objectDifference.get(i).imageNumber = typeCounter.get(this.objectDifference.get(i).type).randomArray[typeCounter.get(this.objectDifference.get(i).type).index]
            this.objectDifference.get(i + boardLocators.size / 2).imageNumber = typeCounter.get(this.objectDifference.get(i).type).randomArray[typeCounter.get(this.objectDifference.get(i).type).index]
            typeCounter.get(this.objectDifference.get(i).type).index++
        }
        for (let i = 0; i <= (boardLocators.size / 2 - 1); i++) {
            const transform = boardLocators.get(`obj_difference1_${i + 1}`)
            let isCorrect = differenceId[i + 1] == i + 1 ? false : true
            let type = "circle"
            if (transform!.scale.x - transform!.scale.y <= -0.1) type = "vertical"
            else if (transform!.scale.x - transform!.scale.y >= 0.1) type = "horizontal"
            this.objectDifference.set(i, { transform, isCorrect, type, imageNumber: 1 })
            this.objectDifference.set(i + boardLocators.size / 2, { transform, isCorrect, type, imageNumber: 1 })
            typeHandler(i)
        }
        this.objectDifference.forEach((e, key) => console.log(key, e))
    }

    private changeCounter(correct: boolean = true) {
        if (correct) {
            this.correctSmashCounter++
            TextShape.getMutable(steampunkGameState.listOfEntity.get('findCounter')).text = `Find \n ${this.correctSmashCounter}/${correctTargetAmount[this.playerLevel - 1]}`
            this.playerReturnData.playerScore = this.playerReturnData.playerScore + steampunkGameConfig.awardMultiplier
        } else this.playerReturnData.playerScore = this.playerReturnData.playerScore - steampunkGameConfig.awardMultiplier
        TextShape.getMutable(steampunkGameState.listOfEntity.get('hits')).text = `Hits \n${this.playerReturnData.playerScore}`
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
        engine.removeSystem('countdown-system')
        this.playerReturnData.playerFinishTime = Date.now()
        timer.hide();
        this.resolveReady()
        Material.setPbrMaterial(steampunkGameState.listOfEntity.get('firstBoard'), { texture: Material.Texture.Common({ src: `images/scene-thumbnail.png` }) })
        Material.setPbrMaterial(steampunkGameState.listOfEntity.get('secondBoard'), { texture: Material.Texture.Common({ src: `images/scene-thumbnail.png` }) })
        TextShape.getMutable(steampunkGameState.listOfEntity.get('findCounter')).text = `Find \n0/0`
    }
}
