import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { gameState } from "./state";
import { EasingFunction, engine, GltfContainer, MeshRenderer, Transform, Tween, VisibilityComponent } from "@dcl/sdk/ecs";
import { entityConfig } from "./config";
import { kitty } from "./resources/resources";
import { parentEntity, syncEntity } from "@dcl/sdk/network";

export class board {

    private numberOfBoardElements: number = 0
    private position

    constructor(position: Vector3) {
        
        this.position = position
        this.init()
    }

    private init () {
        gameState.rocketWindow = engine.addEntity()
        Transform.createOrReplace(gameState.rocketWindow,
            {
                position: this.position,
                rotation: Quaternion.Zero(),
                scale: Vector3.create(2, 2, 2)
            })
        MeshRenderer.setPlane(gameState.rocketWindow)
        syncEntity(gameState.rocketWindow, [Transform.componentId], 5000)
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
                position: Vector3.create((x - 2) * entityConfig.spacing, (y - 2) * entityConfig.spacing, +.2),
                scale: Vector3.create(entityConfig.initialEntitySize, entityConfig.initialEntitySize, entityConfig.initialEntitySize)
            })
            x++
            if (x * (Math.abs(entityConfig.initialEntitySize) + Math.abs(entityConfig.spacing)) > entityConfig.maxRowLength) {
                x = 0
                y++
            }
            parentEntity(entity, gameState.rocketWindow!)
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