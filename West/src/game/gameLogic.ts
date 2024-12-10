import * as utils from '@dcl-sdk/utils'
import { EasingFunction, Entity, InputAction, pointerEventsSystem, TextShape, Transform, Tween } from "@dcl/sdk/ecs";
import { tempLocators, westGameConfig } from "../config";
import { westGameState } from "../state";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { levels } from '../levels';

export class GameLogic {
    private timeoutByEntity: Map<Entity, utils.TimerId> = new Map()
    private endRoundTimeout = 0
    private playerLevel = 0
    private playerHP = westGameConfig.playerMaxHP
    private targetData = new Map()
    private playerScore = 0

    public startGame() {
        this.resetData()
        this.playGame()
    }

    private playGame() {
        this.targetData.clear()
        this.setPlayerLevel()
        const levelData = levels.get(this.playerLevel)
        const remainingArray = [...levelData!.role];
        this.endRoundTimeout = utils.timers.setTimeout(() => this.finishRound(), levelData!.stayTime + levelData!.appearanceTime * 2 + 100)
        for (let i = 0; i < levelData!.targetAmount; i++) {
            Tween.deleteFrom(westGameState.availableEntity[i])
            Transform.createOrReplace(westGameState.availableEntity[i], tempLocators.get(`obj_locator_${Math.floor(Math.random() * 5) + 1}`))
            this.spawnEntity(westGameState.availableEntity[i])
            const randomIndex = Math.floor(Math.random() * remainingArray.length);
            const chosenRole = remainingArray[randomIndex]
            remainingArray.splice(randomIndex, 1);
            this.targetData.set(i, { entity: westGameState.availableEntity[i], enemy: chosenRole, dead: false })
            pointerEventsSystem.onPointerDown(
                {
                    entity: westGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
                    this.targetData.get(i).dead = true
                    console.log(westGameState.availableEntity[i], ' is clicked, he was Bandit? ', this.targetData.get(i).enemy)
                    Tween.deleteFrom(westGameState.availableEntity[i])
                    utils.timers.clearTimeout(this.timeoutByEntity.get(westGameState.availableEntity[i])!)
                    pointerEventsSystem.removeOnPointerDown(westGameState.availableEntity[i])
                    utils.timers.setTimeout(() => this.hitEntity(westGameState.availableEntity[i]), 10)
                    this.targetData.get(i).enemy ? this.playerScore += 10 : this.playerScore -= 10
                    this.updateCounters()
                    !this.isEnemyLeft() && this.stopRound()
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
    }

    private hitEntity(entity: Entity) {
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Rotate({
                start: Transform.get(entity).rotation,
                end: Quaternion.fromEulerDegrees(-90, 1, 1),

            }),
            duration: levels.get(this.playerLevel)!.appearanceTime,
            easingFunction: EasingFunction.EF_EASEINBACK,
        });
    }

    private isEnemyLeft() {
        let enemyLeftCounter = 0
        this.targetData.forEach(data => { if (data.enemy && !data.dead) enemyLeftCounter++ })
        return enemyLeftCounter == 0 ? false : true
    }

    private hitPlayer() {
        this.playerHP = this.playerHP - 10
        console.log("Hit PLAYER ", this.playerHP)
        this.updateCounters()
        this.playerHP <= 0 && this.stopGame()
    }

    private updateCounters() {
        const playerHPText = westGameState.listOfEntity.get('playerHP')
        TextShape.getMutable(playerHPText).text = `HP \n${this.playerHP}`
        const playerScoreText = westGameState.listOfEntity.get('score')
        TextShape.getMutable(playerScoreText).text = `Score \n${this.playerScore}`
    }

    private finishRound() {
        console.log("Lose ROUND")
        this.targetData.forEach(data => {
            console.log(data)
            if (!data.dead && data.enemy) this.hitPlayer()
        })
        this.stopRound()
    }

    private stopRound(exit: boolean = false) {
        console.log("Stop ROUND")
        utils.timers.clearTimeout(this.endRoundTimeout)
        for (let i = 0; i < levels.get(this.playerLevel)!.targetAmount; i++) {
            utils.timers.clearTimeout(this.timeoutByEntity.get(westGameState.availableEntity[i])!)
            Tween.deleteFrom(westGameState.availableEntity[i])
            pointerEventsSystem.removeOnPointerDown(westGameState.availableEntity[i])
            this.hitEntity(westGameState.availableEntity[i])
            utils.timers.setTimeout(() => {
                Tween.deleteFrom(westGameState.availableEntity[i])
                Transform.createOrReplace(westGameState.availableEntity[i], { position: Vector3.create(1, 1, 2), rotation: Quaternion.Zero() })
            }, !exit ? levels.get(this.playerLevel)!.appearanceTime + 100 : 1)
        }
    }

    private setPlayerLevel() {
        this.playerLevel = 1 // TEMP
        console.log("Player Level: ", this.playerLevel)
    }

    private resetData() {
        this.endRoundTimeout = 0
        this.playerLevel = 0
        this.playerHP = westGameConfig.playerMaxHP
        this.playerScore = 0
        this.updateCounters()
        this.targetData.clear()
    }

    public stopGame() {
        this.stopRound(true)
    }
}