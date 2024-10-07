import * as utils from '@dcl-sdk/utils'
import { Vector3 } from "@dcl/sdk/math";
import { gameState, rocketCoords } from "./state";
import { EasingFunction, engine, GltfContainer, Transform, Tween } from "@dcl/sdk/ecs";
import { background, cat01, cat02 } from "./resources/resources";
import { readGltfLocators } from "../../common/locators";
import { sceneParentEntity } from './globals';
import { timerConfig } from './config';

export class board {

    private numberOfBoardElements: number = 0
    private data: any

    private resolveReady!: () => void
    private dataIsDone: Promise<void>

    constructor() {
        this.dataIsDone = new Promise((res) => { this.resolveReady = res })
        this.init();
    }

    private async init() {
        this.data = await readGltfLocators(`locators/obj_background.gltf`)
        this.resolveReady()
        Transform.createOrReplace(gameState.rocketWindow!, { position: { ...Vector3.add(this.data.get('background')?.position, Transform.get(sceneParentEntity).position), y: this.data.get('background')?.position.y - 5 }, scale: this.data.get('background')?.scale })
        console.log(Transform.get(sceneParentEntity).position)
        GltfContainer.createOrReplace(gameState.rocketWindow!, { src: background.src })
        for (let i = 0; i < gameState.entityInRoket.length - 1; i++) {
            const entity = gameState.entityInRoket[i]
            let entityTransform = this.data.get(`cat0${i + 1}`)
            Transform.createOrReplace(entity, entityTransform)
        }
        for (let i = 0; i < gameState.counterEntity.length - 1; i++) {
            const entity = gameState.counterEntity[i]
            let entityTransform = i == 0 ? this.data.get(`counter_enteredAnswer`) : this.data.get(`counter_correctAnswer`)
            Transform.createOrReplace(entity, entityTransform)
        }
    }

    private async initBoardElements() {
        let delay = timerConfig.initialCatTimeGap
        for (let i = 0; i < gameState.entityInRoket.length - 1; i++) {
            const entity = gameState.entityInRoket[i]
            GltfContainer.createOrReplace(entity, { src: cat01.src })
        }
        for (let i = 0; i < this.numberOfBoardElements; i++) {
            const entity = gameState.entityInRoket[i]
            Tween.deleteFrom(entity)
            utils.timers.setTimeout(() => {
                GltfContainer.createOrReplace(entity, { src: cat02.src })
                Tween.createOrReplace(entity, {
                    mode: Tween.Mode.Scale({
                        start: Vector3.create(.2, .2, .2),
                        end: this.data.get(`cat01`)?.scale,
                    }),
                    duration: timerConfig.catIconAnimationTime,
                    easingFunction: EasingFunction.EF_LINEAR,
                    playing: true
                })
            }, delay)
            delay = delay + timerConfig.additionCatTimeGap
        }
    }

    public async showBoard(numberOfBoardElements: number) {
        await this.dataIsDone;
        this.numberOfBoardElements = numberOfBoardElements
        Tween.createOrReplace(gameState.rocketWindow, {
            mode: Tween.Mode.Move({
                start: Transform.get(gameState.rocketWindow!).position,
                end: { ...Transform.get(gameState.rocketWindow!).position, y: rocketCoords.y + 5 },
            }),
            duration: 500,
            easingFunction: EasingFunction.EF_LINEAR,
        })
        await this.initBoardElements();
    }

    public async hideBoard() {
        Tween.createOrReplace(gameState.rocketWindow!, {
            mode: Tween.Mode.Move({
                start: Transform.get(gameState.rocketWindow!).position,
                end: { ...Transform.get(gameState.rocketWindow!).position, y: rocketCoords.y - 5 },
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
        await this.dataIsDone;
        let delay = 400
        const entity = gameState.counterEntity[leftCounter ? 0 : 1]
        for (let i = 0; i <= showNumber; i++) {
            Tween.deleteFrom(entity)
            utils.timers.setTimeout(() => {
                GltfContainer.createOrReplace(entity, { src: `models/obj_0${i}.gltf` });
                Tween.createOrReplace(entity, {
                    mode: Tween.Mode.Scale({
                        start: Vector3.create(.5 + i / 20, .5 + i / 20, .5 + i / 20),
                        end: this.data.get(`counter_correctAnswer`)?.scale,
                    }),
                    duration: 100,
                    easingFunction: EasingFunction.EF_LINEAR,
                })
            }, delay)
            delay = delay + 100
        }
    }
}