import * as utils from '@dcl-sdk/utils'
import { EasingFunction, Entity, InputAction, pointerEventsSystem, Transform, Tween } from "@dcl/sdk/ecs";
import { tempLocators, westGameConfig } from "../config";
import { westGameState } from "../state";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { levels } from '../levels';

export class GameLogic {
    private timeoutByEntity: Map<Entity, utils.TimerId> = new Map()

    public startGame() {
        this.playGame()
    }

    private playGame() {
        // const newPosition = this.generateNextMove()
        const levelData = levels.get(1)
        this.timeoutByEntity.forEach(e => utils.timers.clearTimeout(e))
        for (let i = 0; i < levelData!.amount; i++) {
            Tween.deleteFrom(westGameState.availableEntity[i])
            Transform.createOrReplace(westGameState.availableEntity[i], tempLocators.get(`obj_locator_${Math.floor(Math.random() * 5) + 1}`))
            this.spawnEntity(westGameState.availableEntity[i])
            pointerEventsSystem.onPointerDown(
                {
                    entity: westGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
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

    private generateNextMove() {
        const newPosition = Math.floor(Math.random() * westGameConfig.horizontalRightLimit * 2 + westGameConfig.horizontalLeftLimit)
        console.log("New Position is: ", newPosition)
        return newPosition
    }

    private spawnEntity(entity: Entity) {
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Rotate({
                start: Quaternion.fromEulerDegrees(-90, 1, 1),
                end: Quaternion.fromEulerDegrees(0, 0, 0)

            }),
            duration: 1000,
            easingFunction: EasingFunction.EF_EASEINBACK,
        });
        utils.timers.setTimeout(() => this.moveEntity(entity), 1100)
    }

    private hitEntity(entity: Entity) {
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Rotate({
                start: Quaternion.fromEulerDegrees(0, 0, 0),
                end: Quaternion.fromEulerDegrees(-90, 1, 1),

            }),
            duration: 1000,
            easingFunction: EasingFunction.EF_EASEINBACK,
        });
    }

    private moveEntity(entity: Entity) {
        console.log("Move entity: ", entity)
        const currentCoord = Transform.get(entity).position
        const nextPoint = this.generateNextMove()
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Move({
                start: currentCoord,
                end: Vector3.create(nextPoint, currentCoord.y, currentCoord.z)

            }),
            duration: 1000 * Math.abs(currentCoord.x - nextPoint),
            easingFunction: EasingFunction.EF_LINEAR,
        });
        let timeOut = utils.timers.setTimeout(() => { this.moveEntity(entity) }, 1000 * Math.abs(currentCoord.x - nextPoint) + 100)
        this.timeoutByEntity.set(entity, timeOut)
    }

}