import * as utils from '@dcl-sdk/utils'
import { EasingFunction, Entity, InputAction, pointerEventsSystem, Transform, Tween } from "@dcl/sdk/ecs";
import { tempLocators, westGameConfig } from "../config";
import { westGameState } from "../state";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { levels } from '../levels';

export class GameLogic {
    private timeoutByEntity: Map<Entity, utils.TimerId> = new Map()
    private playerLevel = 0

    public startGame() {
        this.playGame()
    }

    private playGame() {
        // const newPosition = this.generateNextMove()
        this.setPlayerLevel()
        const levelData = levels.get(this.playerLevel)
        this.stopRound()
        const remainingArray = [...levelData!.role];
        utils.timers.setTimeout(() => this.stopRound(), levelData!.stayTime + levelData!.appearanceTime * 2 + 100)
        for (let i = 0; i < levelData!.targetAmount; i++) {
            Tween.deleteFrom(westGameState.availableEntity[i])
            Transform.createOrReplace(westGameState.availableEntity[i], tempLocators.get(`obj_locator_${Math.floor(Math.random() * 5) + 1}`))
            this.spawnEntity(westGameState.availableEntity[i])
            const randomIndex = Math.floor(Math.random() * remainingArray.length);
            const chosenRole = remainingArray[randomIndex]
            remainingArray.splice(randomIndex, 1);
            console.log(chosenRole);
            pointerEventsSystem.onPointerDown(
                {
                    entity: westGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
                    console.log(chosenRole ? "-10" : "+10")
                    console.log(westGameState.availableEntity[i], ' is clicked')
                    Tween.deleteFrom(westGameState.availableEntity[i])
                    // Transform.getMutable(westGameState.availableEntity[i]).position = Transform.get(westGameState.availableEntity[i]).position
                    utils.timers.clearTimeout(this.timeoutByEntity.get(westGameState.availableEntity[i])!)
                    utils.timers.setTimeout(() => this.hitEntity(westGameState.availableEntity[i]), 10)
                    pointerEventsSystem.removeOnPointerDown(westGameState.availableEntity[i])
                }
            )
        }
    }

    private spawnEntity(entity: Entity) {
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Rotate({
                start: Quaternion.fromEulerDegrees(-90, 1, 1),
                end: Quaternion.fromEulerDegrees(0, 0, 0)
            }),
            duration: levels.get(this.playerLevel)!.appearanceTime,
            easingFunction: EasingFunction.EF_EASEINBACK,
        });
        utils.timers.setTimeout(() => this.moveEntity(entity), levels.get(this.playerLevel)!.appearanceTime + 50)
    }

    private hitEntity(entity: Entity) {
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Rotate({
                start: Quaternion.fromEulerDegrees(0, 0, 0),
                end: Quaternion.fromEulerDegrees(-90, 1, 1),

            }),
            duration: levels.get(this.playerLevel)!.appearanceTime,
            easingFunction: EasingFunction.EF_EASEINBACK,
        });
    }

    private moveEntity(entity: Entity) {
        console.log("Move entity: ", entity)
        const currentCoord = Transform.get(entity).position
        const randomNumber = Math.floor(Math.random() * 5) + 1
        const random = tempLocators.get(`obj_locator_${randomNumber}`)!.position
        console.log(randomNumber, random)
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Move({
                start: currentCoord,
                end: random

            }),
            duration: levels.get(this.playerLevel)!.speed,
            easingFunction: EasingFunction.EF_LINEAR,
        });
        this.timeoutByEntity.set(entity, utils.timers.setTimeout(() => { this.moveEntity(entity) }, levels.get(this.playerLevel)!.speed+ 100))
    }

    private stopRound() {
        for (let i = 0; i < westGameConfig.targetEntityAmount; i++) {
            utils.timers.clearTimeout(this.timeoutByEntity.get(westGameState.availableEntity[i])!)
            Tween.deleteFrom(westGameState.availableEntity[i])
            pointerEventsSystem.removeOnPointerDown(westGameState.availableEntity[i])
            utils.timers.setTimeout(() => { this.hitEntity(westGameState.availableEntity[i]) }, 10)
            utils.timers.setTimeout(() => {
                Transform.createOrReplace(westGameState.availableEntity[i], { position: Vector3.create(1, 1, 2), rotation: Quaternion.Zero() })
            }, levels.get(this.playerLevel)!.appearanceTime + 100)
        }
    }

    private setPlayerLevel() {
        this.playerLevel = 1 // TEMP
        console.log("Player Level: ", this.playerLevel)
    }

    public stopGame() {
        this.stopRound()
    }
}