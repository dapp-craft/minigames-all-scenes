import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { gameState, rocketCoords } from "./state";
import { EasingFunction, engine, GltfContainer, MeshRenderer, Transform, Tween, VisibilityComponent } from "@dcl/sdk/ecs";
import { entityConfig } from "./config";
import { background, cat01, cat02, kitty } from "./resources/resources";
import { parentEntity, syncEntity } from "@dcl/sdk/network";
import { readGltfLocators } from "../../common/locators";

export class board {

    private numberOfBoardElements: number = 0

    constructor() {
        this.init()
    }

    private async init() {
        const data = await readGltfLocators(`locators/obj_background.gltf`)
        gameState.rocketWindow = engine.addEntity()
        Transform.createOrReplace(gameState.rocketWindow, {position: rocketCoords, scale: data.get('background')?.scale})
        GltfContainer.createOrReplace(gameState.rocketWindow, { src: background.src })
        syncEntity(gameState.rocketWindow, [Transform.componentId], 5000)
    }

    private async initBoardElements() {
        const data = await readGltfLocators(`locators/obj_background.gltf`)
        for (let i = 0; i < gameState.entityInRoket.length - 1; i++) {
            const entity = gameState.entityInRoket[i]
            GltfContainer.createOrReplace(entity, { src: cat01.src })
            Transform.createOrReplace(entity, data.get(`cat0${i + 1}`))
            parentEntity(entity, gameState.rocketWindow!)
        }
        for (let i = 0; i < this.numberOfBoardElements; i++) {
            const entity = gameState.entityInRoket[i]
            GltfContainer.createOrReplace(entity, { src: cat02.src })
        }
    }

    public async showBoard(numberOfBoardElements: number) {
        this.numberOfBoardElements = numberOfBoardElements
        Tween.createOrReplace(gameState.rocketWindow!, {
            mode: Tween.Mode.Move({
                start: Transform.get(gameState.rocketWindow!).position,
                end: Vector3.create(Transform.get(gameState.rocketWindow!).position.x, Transform.get(gameState.rocketWindow!).position.y + 5, Transform.get(gameState.rocketWindow!).position.z),
            }),
            duration: 500,
            easingFunction: EasingFunction.EF_LINEAR,
        })
        await this.initBoardElements();
    }

    public hideBoard() {
        Tween.createOrReplace(gameState.rocketWindow!, {
            mode: Tween.Mode.Move({
                start: Transform.get(gameState.rocketWindow!).position,
                end: Vector3.create(Transform.get(gameState.rocketWindow!).position.x, Transform.get(gameState.rocketWindow!).position.y - 5, Transform.get(gameState.rocketWindow!).position.z),
            }),
            duration: 500,
            easingFunction: EasingFunction.EF_LINEAR,
        })
    }
}