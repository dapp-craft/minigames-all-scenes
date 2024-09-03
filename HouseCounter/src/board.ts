import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { gameState } from "./state";
import { EasingFunction, engine, GltfContainer, MeshRenderer, Transform, Tween, VisibilityComponent } from "@dcl/sdk/ecs";
import { entityConfig } from "./config";
import { kitty } from "./resources/resources";

export class board {

    private numberOfBoardElements: number = 0
    private position

    constructor(position: Vector3) {
        gameState.rocketWindow = engine.addEntity()
        Transform.createOrReplace(gameState.rocketWindow,
            {
                position: position,
                rotation: Quaternion.Zero(),
                scale: Vector3.create(3, 3, 3)
            })
        MeshRenderer.setPlane(gameState.rocketWindow)
        this.position = position
    }

    private initBoardElements() {
        let x = 0
        let y = 0

        gameState.entityInRoket.forEach(entity => {
            VisibilityComponent.createOrReplace(entity, { visible: false })
        })
        for (let i = 0; i < this.numberOfBoardElements; i++) {
            const entity = gameState.entityInRoket[i]
            VisibilityComponent.createOrReplace(entity, { visible: true })
            GltfContainer.createOrReplace(entity, { src: kitty.src })
            Transform.createOrReplace(entity, {
                parent: gameState.rocketWindow!,
                position: Vector3.create((x - 2) * entityConfig.spacing, (y - 2) * entityConfig.spacing, +.2),
                scale: Vector3.create(entityConfig.initialEntitySize, entityConfig.initialEntitySize, entityConfig.initialEntitySize)
            })
            x++
            if (x * (Math.abs(entityConfig.initialEntitySize) + Math.abs(entityConfig.spacing)) > entityConfig.maxRowLength) {
                x = 0
                y++
            }
        }
    }

    public showBoard(numberOfBoardElements: number) {
        this.numberOfBoardElements = numberOfBoardElements
        Tween.createOrReplace(gameState.rocketWindow!, {
            mode: Tween.Mode.Move({
                start: Transform.get(gameState.rocketWindow!).position,
                end: Vector3.create(this.position.x, this.position.y + 5, this.position.z),
            }),
            duration: 500,
            easingFunction: EasingFunction.EF_LINEAR,
        })
        this.initBoardElements()
    }

    public hideBoard() {
        Tween.createOrReplace(gameState.rocketWindow!, {
            mode: Tween.Mode.Move({
                start: Transform.get(gameState.rocketWindow!).position,
                end: Vector3.create(this.position.x, this.position.y - 5, this.position.z),
            }),
            duration: 500,
            easingFunction: EasingFunction.EF_LINEAR,
        })
    }
}