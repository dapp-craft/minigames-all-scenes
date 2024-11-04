import { InputAction, pointerEventsSystem, TextShape } from "@dcl/sdk/ecs"
import { correctEntity, data, steampunkGameState } from "../gameState"

export class GameLogic {
    // private listOfCorrectTarget = new Map()
    private correctSmashCounter = 0
    private miss = 0

    public async startGame() {
        this.initializeGame()

        this.playGame()
    }

    private async initializeGame() {
        // this.listOfCorrectTarget = new Map()
        for (let i = 0; i <= data.size; i++) {
            // if (data.has(correctEntity[i])) this.listOfCorrectTarget.set(correctEntity[i], steampunkGameState.availableEntity[i])
            console.log("Here", correctEntity[i], steampunkGameState.availableEntity[i])
            pointerEventsSystem.onPointerDown(
                {
                    entity: steampunkGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
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

    private playGame() {

    }
}
