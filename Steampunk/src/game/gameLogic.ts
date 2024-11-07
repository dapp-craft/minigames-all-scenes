import { ColliderLayer, GltfContainer, InputAction, Material, PBGltfContainer, pointerEventsSystem, TextShape, TextureFilterMode, TextureWrapMode, Transform } from "@dcl/sdk/ecs"
import { correctTargetAmount, data, steampunkGameState } from "../gameState"
import { steampunkGameConfig } from "../gameConfig"
import { readGltfLocators } from "../../../common/locators"

export class GameLogic {
    private correctSmashCounter = 0
    private playerLevel = 1
    private pictureNumber = 1

    public async startGame() {
        this.resetProgress()
        this.playGame()
    }

    private resetProgress() {
        this.playerLevel = 1
    }

    private async playGame() {
        const data = await readGltfLocators(`locators/obj_locators_unique1.gltf`)
        Material.setPbrMaterial(steampunkGameState.listOfEntity.get('firstBoard'), { texture: Material.Texture.Common({ src: `images/level${this.playerLevel}_${this.pictureNumber}.png` }) })
        Material.setPbrMaterial(steampunkGameState.listOfEntity.get('secondBoard'), { texture: Material.Texture.Common({ src: `images/level${this.playerLevel}_${this.pictureNumber}.png` }) })

        for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) {
            const path: PBGltfContainer = { src: `models/target${this.playerLevel}_${i + 1}/target${this.playerLevel}_${i + 1}.gltf` };
            GltfContainer.create(steampunkGameState.availableEntity[i], {
                ...path,
                invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
                visibleMeshesCollisionMask: ColliderLayer.CL_POINTER
            })
            Transform.createOrReplace(steampunkGameState.availableEntity[i], { ...data.get(`target${this.playerLevel}_${i + 1}`), parent: steampunkGameState.listOfEntity.get('display') })
            // console.log(GltfContainer.get(steampunkGameState.availableEntity[i]), Transform.get(steampunkGameState.availableEntity[i]))
            pointerEventsSystem.onPointerDown(
                {
                    entity: steampunkGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
                    pointerEventsSystem.removeOnPointerDown(steampunkGameState.availableEntity[i])
                    if (i < correctTargetAmount[i]) {
                        this.changeCounter()
                    }
                }
            )
        }
    }

    private changeCounter() {
        this.correctSmashCounter = this.correctSmashCounter + 1
        TextShape.getMutable(steampunkGameState.listOfEntity.get('hits')).text = `Hits \n${this.correctSmashCounter}`
        console.log(+1)
    }
}
