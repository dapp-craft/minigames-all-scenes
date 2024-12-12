import * as utils from '@dcl-sdk/utils'
import { EasingFunction, Entity, InputAction, Material, pointerEventsSystem, TextShape, Transform, Tween } from "@dcl/sdk/ecs";
import { tempLocators, westGameConfig, westLevelsConfig } from "../config";
import { westGameState } from "../state";
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math";
import { levels } from '../levels';

export class GameLogic {
    private timeoutByEntity: Map<Entity, utils.TimerId> = new Map()
    private endRoundTimeout = 0
    private playerLevel = 1
    private playerHP = westGameConfig.playerMaxHP
    private targetData = new Map()
    private playerScore = 0

    public async startGame() {
        await this.stopGame()
        this.playGame()
    }

    private playGame() {
        this.targetData.clear()
        const levelData = levels.get(this.playerLevel)
        this.endRoundTimeout = utils.timers.setTimeout(() => this.finishRound(), levelData!.stayTime + westLevelsConfig.initialAppearanceTime / this.playerLevel * 2 + 100)
        const levelTargetsAmount = levelData!.role.reduce((a, b) => a + b, 0)
        const targetPositionArray = this.spawnRandomizer(levelData!.generationType, levelTargetsAmount)
        const roles = [...Array(levelData!.role[0]).fill(1), ...Array(levelData!.role[1]).fill(0)];
        roles.sort(() => Math.random() - 0.5);
        for (let i = 0; i < levelTargetsAmount; i++) {
            Tween.deleteFrom(westGameState.availableEntity[i])
            Transform.createOrReplace(westGameState.availableEntity[i], tempLocators.get(`obj_locator_${targetPositionArray![i]}`))
            this.setTexture(westGameState.availableEntity[i], roles[i])
            this.spawnEntity(westGameState.availableEntity[i])
            this.targetData.set(i, { entity: westGameState.availableEntity[i], enemy: roles[i], dead: false })
            pointerEventsSystem.onPointerDown(
                {
                    entity: westGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
                    this.targetData.get(i).dead = true
                    console.log(westGameState.availableEntity[i], ' is clicked, he was Bandit? ', this.targetData.get(i).enemy)
                    utils.timers.clearTimeout(this.timeoutByEntity.get(westGameState.availableEntity[i])!)
                    Tween.deleteFrom(westGameState.availableEntity[i])
                    pointerEventsSystem.removeOnPointerDown(westGameState.availableEntity[i])
                    utils.timers.setTimeout(() => this.hitEntity(westGameState.availableEntity[i]), 10)
                    this.targetData.get(i).enemy ? this.playerScore += 10 : this.playerScore -= 10
                    this.updateCounters()
                    this.isEnemyLeft()
                }
            )
        }
    }

    // TO DO: REFACTOR
    private spawnRandomizer(spawnType: string, entityAmount: number) {
        console.log("spawnRandomizer TYPE: ", spawnType);
        const generator = ({ firstRow, gap = 1, entityAmountInRow = entityAmount }: { firstRow: boolean, gap?: number | "random", entityAmountInRow?: number }) => {
            let randomGap = false
            if (typeof (gap) === "string") {
                gap = 1
                randomGap = true
            }
            const start = entityAmountInRow < 3 ? Math.floor(Math.random() * 5) + 1 : 1
            const sequence: number[] = [start]
            let increasing = true
            for (let i = 1; i < entityAmountInRow; i++) {
                if (randomGap) {
                    let randomLimit = entityAmountInRow >= 3 ? 2 : 3
                    gap = Math.floor(Math.random() * randomLimit + 1)
                }
                const prev = sequence[i - 1]
                let next
                if (increasing) {
                    next = prev + gap
                    if (next > 5) {
                        increasing = false
                        next = start - gap
                        if (next <= 0) next = 1
                    } 
                } else next = prev - gap
                sequence.push(next)
            }
            if (!firstRow) sequence.forEach((_, i) => sequence[i] += 5)
            console.log(sequence)
            return sequence
        }
        console.log("TYPE: ", spawnType)
        switch (spawnType) {
            case 'row':
                return generator({ firstRow: true })
            case 'gapRow':
                return generator({ firstRow: true, gap: 'random' })
            case 'twoLevels': {
                const firstLevel = Math.random() < 0.5
                const odd = entityAmount % 2 !== 0
                const entityAmountInRow = Math.ceil(entityAmount / 2)
                const firstArray = generator({
                    firstRow: firstLevel,
                    gap: 'random',
                    entityAmountInRow: odd ? entityAmountInRow - 1 : entityAmountInRow
                })
                const secondArray = generator({
                    firstRow: !firstLevel,
                    gap: 'random',
                    entityAmountInRow
                })
                const response = [...firstArray, ...secondArray]
                console.log('Concat: ', response)
                return response
            }
            default:
                throw new Error(`Unknown spawnType: ${spawnType}`)
        }
    }

    private setTexture(entity: Entity, bandit: boolean) {
        Material.setPbrMaterial(entity, {
            albedoColor: bandit ? Color4.Red() : Color4.Blue(),
        })
    }

    private spawnEntity(entity: Entity) {
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Rotate({
                start: Quaternion.fromEulerDegrees(-90, 1, 1),
                end: Quaternion.fromEulerDegrees(0, 0, 0)
            }),
            duration: westLevelsConfig.initialAppearanceTime / this.playerLevel,
            easingFunction: EasingFunction.EF_EASEINBACK,
        });
    }

    private hitEntity(entity: Entity) {
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Rotate({
                start: Transform.get(entity).rotation,
                end: Quaternion.fromEulerDegrees(-90, 1, 1),

            }),
            duration: westLevelsConfig.initialAppearanceTime / this.playerLevel / 4,
            easingFunction: EasingFunction.EF_EASEINBACK,
        });
    }

    private async isEnemyLeft() {
        let enemyLeftCounter = 0
        this.targetData.forEach(data => { if (data.enemy && !data.dead) enemyLeftCounter++ })
        const enemyLeft = enemyLeftCounter == 0
        if (enemyLeft && this.playerHP > 0) {
            const isLevelsLeft = this.setPlayerLevel()
            if (!isLevelsLeft) return
            await this.stopRound()
            this.playGame()
        }
    }

    private hitPlayer() {
        this.playerHP = this.playerHP - 10
        console.log("Hit PLAYER ", this.playerHP)
        this.updateCounters()
        if (this.playerHP <= 0) this.stopGame()
    }

    private updateCounters() {
        const playerHPText = westGameState.listOfEntity.get('playerHP')
        TextShape.getMutable(playerHPText).text = `HP \n${this.playerHP}`
        const playerScoreText = westGameState.listOfEntity.get('score')
        TextShape.getMutable(playerScoreText).text = `Score \n${this.playerScore}`
    }

    private async finishRound() {
        console.log("Lose ROUND")
        this.targetData.forEach(data => {
            console.log(data)
            if (!data.dead && data.enemy) this.hitPlayer()
        })
        if (this.playerHP <= 0) return
        await this.stopRound()
        this.playGame()
    }

    private async stopRound(noAnimation: boolean = false) {
        console.log("Stop ROUND")
        let resolveReady!: () => void
        let RoundIsStopped = new Promise((res: any) => { resolveReady = res })
        utils.timers.clearTimeout(this.endRoundTimeout)
        for (let i = 0; i < levels.get(this.playerLevel)!.role.reduce((a, b) => a + b, 0); i++) {
            utils.timers.clearTimeout(this.timeoutByEntity.get(westGameState.availableEntity[i])!)
            Tween.deleteFrom(westGameState.availableEntity[i])
            pointerEventsSystem.removeOnPointerDown(westGameState.availableEntity[i])
            this.hitEntity(westGameState.availableEntity[i])
            utils.timers.setTimeout(() => {
                Tween.deleteFrom(westGameState.availableEntity[i])
                Transform.createOrReplace(westGameState.availableEntity[i], { position: Vector3.create(1, 1, 2), rotation: Quaternion.Zero() })
                resolveReady()
            }, !noAnimation ? westLevelsConfig.initialAppearanceTime / this.playerLevel + 100 : 1)
        }
        // if (noAnimation) return
        await RoundIsStopped;
    }

    private setPlayerLevel() {
        // TEMP
        if (this.playerLevel >= levels.size) {
            this.stopGame()
            console.log("GAME OVER!")
            return false
        }
        this.playerLevel++
        console.log("Player Level: ", this.playerLevel)
        return true
    }

    private resetData() {
        this.endRoundTimeout = 0
        this.playerLevel = 1
        this.playerHP = westGameConfig.playerMaxHP
        this.playerScore = 0
        this.updateCounters()
        this.targetData.clear()
    }

    public async stopGame() {
        await this.stopRound()
        this.resetData()
    }
}