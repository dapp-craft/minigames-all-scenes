import * as utils from '@dcl-sdk/utils'
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { gameState, rocketCoords } from "./state";
import { EasingFunction, engine, Entity, GltfContainer, MeshRenderer, Transform, Tween, VisibilityComponent } from "@dcl/sdk/ecs";
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
        Transform.createOrReplace(gameState.rocketWindow, { position: rocketCoords, scale: data.get('background')?.scale })
        GltfContainer.createOrReplace(gameState.rocketWindow, { src: background.src })
        syncEntity(gameState.rocketWindow, [Transform.componentId, GltfContainer.componentId, Tween.componentId], 5000)
        gameState.entityInRoket.forEach((entity: Entity) => parentEntity(entity, gameState.rocketWindow!))
        gameState.counterEntity.forEach((entity: Entity) => parentEntity(entity, gameState.rocketWindow!))
    }

    private async initBoardElements() {
        const data = await readGltfLocators(`locators/obj_background.gltf`)
        let delay = 400
        for (let i = 0; i < gameState.entityInRoket.length - 1; i++) {
            const entity = gameState.entityInRoket[i]
            GltfContainer.createOrReplace(entity, { src: cat01.src })
            Transform.createOrReplace(entity, data.get(`cat0${i + 1}`))
        }
        for (let i = 0; i < this.numberOfBoardElements; i++) {
            const entity = gameState.entityInRoket[i]
            Tween.deleteFrom(entity)
            utils.timers.setTimeout(() => {
                GltfContainer.createOrReplace(entity, { src: cat02.src })
                Tween.createOrReplace(entity, {
                    mode: Tween.Mode.Scale({
                        start: Vector3.create(.2, .2, .2),
                        end: data.get(`cat01`)?.scale,
                    }),
                    duration: 300,
                    easingFunction: EasingFunction.EF_LINEAR,
                    playing: true
                })
            }, delay)
            delay = delay + 100
        }
    }

    public async showBoard(numberOfBoardElements: number) {
        this.numberOfBoardElements = numberOfBoardElements
        Tween.createOrReplace(gameState.rocketWindow!, {
            mode: Tween.Mode.Move({
                start: Transform.get(gameState.rocketWindow!).position,
                end: Vector3.create(Transform.get(gameState.rocketWindow!).position.x, rocketCoords.y + 5, Transform.get(gameState.rocketWindow!).position.z),
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
                end: Vector3.create(Transform.get(gameState.rocketWindow!).position.x, rocketCoords.y - 5, Transform.get(gameState.rocketWindow!).position.z),
            }),
            duration: 500,
            easingFunction: EasingFunction.EF_LINEAR,
        })
    }

    public async setLeftCounter(showNumber: number) {
        this.showNumber(true, showNumber)
    }

    public async setRightCounter(showNumber: number) {
        this.showNumber(false, showNumber)
    }

    private async showNumber(leftCounter: boolean, showNumber: number) {
        let delay = 400
        const data = await readGltfLocators(`locators/obj_background.gltf`)
        const entity = gameState.counterEntity[leftCounter ? 0 : 1]
        Transform.createOrReplace(entity, data.get(leftCounter ? `number01` : `number02`))
        for (let i = 0; i <= showNumber; i++) {
            Tween.deleteFrom(entity)
            utils.timers.setTimeout(() => {
                GltfContainer.createOrReplace(entity, { src: `models/obj_0${i}.gltf` });
                Tween.createOrReplace(entity, {
                    mode: Tween.Mode.Scale({
                        start: Vector3.create(.5 + i / 20, .5 + i / 20, .5 + i / 20),
                        end: data.get(`number01`)?.scale,
                    }),
                    duration: 100,
                    easingFunction: EasingFunction.EF_LINEAR,
                })
            }, delay)
            delay = delay + 100
        }
    }
}