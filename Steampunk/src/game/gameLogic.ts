import { ColliderLayer, GltfContainer, InputAction, Material, PBGltfContainer, pointerEventsSystem, TextShape, TextureFilterMode, TextureWrapMode, Transform } from "@dcl/sdk/ecs"
import { correctTargetAmount, data, steampunkGameState } from "../gameState"
import { steampunkGameConfig } from "../gameConfig"
import { readGltfLocators } from "../../../common/locators"

export class GameLogic {
    private correctSmashCounter = 0
    private miss = 0

    public async startGame() {
        this.playGame()
    }

    private async playGame() {
        const data = await readGltfLocators(`locators/locator1.gltf`)
        for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) {
            const path: PBGltfContainer = { src: `models/target1_${i + 1}/target1_${i + 1}.gltf` };
            GltfContainer.create(steampunkGameState.availableEntity[i], {
                ...path,
                invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
                visibleMeshesCollisionMask: ColliderLayer.CL_POINTER
            })
            Transform.createOrReplace(steampunkGameState.availableEntity[i], { ...data.get(`target1_${i + 1}`), parent: steampunkGameState.listOfEntity.get('display') })
            // console.log(GltfContainer.get(steampunkGameState.availableEntity[i]), Transform.get(steampunkGameState.availableEntity[i]))
            pointerEventsSystem.onPointerDown(
                {
                    entity: steampunkGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
                    pointerEventsSystem.removeOnPointerDown(steampunkGameState.availableEntity[i])
                    if (i < correctTargetAmount[i]) {
                        this.changeCounter(true)
                    } else {
                        this.changeCounter(false)
                    }
                }
            )
        }
    }

    private changeCounter(positive: boolean) {
        if (positive) {
            this.correctSmashCounter = this.correctSmashCounter + 1
            TextShape.getMutable(steampunkGameState.listOfEntity.get('hits')).text = `Hits \n${this.correctSmashCounter}`
            console.log(+1)
        } else {
            this.miss++
            TextShape.getMutable(steampunkGameState.listOfEntity.get('miss')).text = `Misses \n${this.miss}`
            console.log(-1)
        }
        TextShape.getMutable(steampunkGameState.listOfEntity.get('counter')).text = `Score \n${(this.correctSmashCounter - this.miss)}`
    }
}
