import * as utils from '@dcl-sdk/utils'
import { ColliderLayer, GltfContainer, InputAction, Material, PBGltfContainer, pointerEventsSystem, TextShape, TextureFilterMode, TextureWrapMode, Transform, VisibilityComponent } from "@dcl/sdk/ecs"
import { correctTargetAmount, steampunkGameState } from "../gameState"
import { steampunkGameConfig } from "../gameConfig"
import { readGltfLocators } from "../../../common/locators"

export class GameLogic {
    private correctSmashCounter = 0
    private playerLevel = 1
    private pictureNumber = 1
    private differencesFound: Array<number | undefined> = []
    private hintTimeOut: utils.TimerId = 0

    public async startGame(level: number = 1) {
        this.resetProgress()
        this.playerLevel = level
        this.playGame()
    }

    private resetProgress(resetGame: boolean = true) {
        if (resetGame) {
            this.playerLevel = 1
            this.pictureNumber = 1
        }
        for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) {
            VisibilityComponent.createOrReplace(steampunkGameState.availableEntity[i], {visible: false})
        }
        this.correctSmashCounter = 0
        TextShape.getMutable(steampunkGameState.listOfEntity.get('hits')).text = `Hits \n${this.correctSmashCounter}`
        this.differencesFound = []
        utils.timers.clearInterval(this.hintTimeOut)
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
                    console.log(i)
                    if (i <= correctTargetAmount[this.playerLevel]) {
                        utils.timers.clearInterval(this.hintTimeOut)
                        VisibilityComponent.getMutable(steampunkGameState.availableEntity[i]).visible = false
                        this.differencesFound[i] = i
                        pointerEventsSystem.removeOnPointerDown(steampunkGameState.availableEntity[i])
                        this.changeCounter()
                    }
                }
            )
        }
    }

    private changeCounter() {
        this.correctSmashCounter = this.correctSmashCounter + 1
        TextShape.getMutable(steampunkGameState.listOfEntity.get('hits')).text = `Hits \n${this.correctSmashCounter}`
        console.log(this.playerLevel)
        if (this.correctSmashCounter >= 5) {
            this.playerLevel++
            this.playGame()
        }
    }

    public getHint() {
        let hintEntityId = undefined
        for (let i = 0; i < correctTargetAmount[this.playerLevel]; i++) {
            if (this.differencesFound[i] == undefined) {
                hintEntityId = i
                break
            }
        }
        console.log(hintEntityId)
        if (hintEntityId == undefined) return
        let hintShowCounter = 0
        this.hintTimeOut = utils.timers.setInterval(() => {
            VisibilityComponent.getMutable(steampunkGameState.availableEntity[hintEntityId]).visible = !VisibilityComponent.getMutable(steampunkGameState.availableEntity[hintEntityId]).visible
            hintShowCounter++
            if (hintShowCounter >= steampunkGameConfig.hintShowTimes * 2) {
                VisibilityComponent.getMutable(steampunkGameState.availableEntity[hintEntityId]).visible = false
                utils.timers.clearInterval(this.hintTimeOut)
            }
        }, steampunkGameConfig.hintDelay)
    }
}
