import { InputAction, Material, pointerEventsSystem, TextShape, TextureFilterMode, TextureWrapMode } from "@dcl/sdk/ecs"
import { correctEntity, data, steampunkGameState } from "../gameState"
import { steampunkGameConfig } from "../gameConfig"

export class GameLogic {
    private correctSmashCounter = 0
    private miss = 0

    public async startGame() {
        this.playGame()
    }

    private async playGame() {
        for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) {
            pointerEventsSystem.onPointerDown(
                {
                    entity: steampunkGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
                    pointerEventsSystem.removeOnPointerDown(steampunkGameState.availableEntity[i])
                    if (correctEntity.find(name => name == correctEntity[i])) {
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
