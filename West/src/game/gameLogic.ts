import * as utils from '@dcl-sdk/utils'
import { ColliderLayer, EasingFunction, engine, Entity, GltfContainer, InputAction, Material, MaterialTransparencyMode, MeshCollider, MeshRenderer, pointerEventsSystem, TextShape, Transform, Tween, VisibilityComponent } from "@dcl/sdk/ecs";
import { westGameConfig, westLevelsConfig } from "../config";
import { westGameState } from "../state";
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math";
import { levels } from '../levels';
import { readGltfLocators } from '../../../common/locators';
import { sceneParentEntity } from '@dcl-sdk/mini-games/src';

interface PlayerData {
    score: number,
    level: number,
    time: number
}

export class GameLogic {
    private endRoundTimeout = 0
    private playerLevel = 1
    private playerHP = westGameConfig.playerMaxHP
    private targetData = new Map()
    private playerScore = 0
    private stopRoundTimers: utils.TimerId[] = []
    private data: any
    private playerData: PlayerData = {score: 0, level: 1, time: Date.now()}
    private gameIsDone: Promise<void>
    private resolveReady!: () => void

    constructor() {
        this.gameIsDone = new Promise((res) => { this.resolveReady = res })
    }

    public async startGame() {
        this.data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
        this.playGame()
        this.gameIsDone = new Promise(r => this.resolveReady = r)
        await this.gameIsDone;
        return this.playerData
    }

    public async restartGame() {
        await this.stopGame()
        this.resetData()
        this.playGame()
    }

    private async playGame() {
        this.targetData.clear()
        const levelData = levels.get(this.playerLevel)
        this.endRoundTimeout = utils.timers.setTimeout(() => this.finishRound(), this.calculateTime().endRoundTimeout)
        const roles = [...Array(levelData!.role[0]).fill(1), ...Array(levelData!.role[1]).fill(0)];
        roles.sort(() => Math.random() - 0.5);
        this.spawnEntity()
        for (let i = 0; i < westGameConfig.targetEntityAmount; i++) {
            Tween.deleteFrom(westGameState.availableEntity[i])
        }
        for (let i = 0; i < levelData!.role.reduce((a, b) => a + b, 0); i++) {
            Tween.deleteFrom(westGameState.availableEntity[i + westGameConfig.targetEntityAmount])
            this.setTexture(westGameState.availableEntity[i], roles[i])
            this.targetData.set(i, { entity: westGameState.availableEntity[i], enemy: roles[i], dead: false })
            pointerEventsSystem.onPointerDown(
                {
                    entity: westGameState.availableEntity[i],
                    opts: { button: InputAction.IA_POINTER, hoverText: 'Click' },
                },
                () => {
                    this.targetData.get(i).dead = true
                    console.log(westGameState.availableEntity[i], ' is clicked, he was Bandit? ', this.targetData.get(i).enemy)
                    Tween.deleteFrom(westGameState.availableEntity[i + westGameConfig.targetEntityAmount])
                    pointerEventsSystem.removeOnPointerDown(westGameState.availableEntity[i])
                    utils.timers.setTimeout(() => this.hitEntity(westGameState.availableEntity[i + westGameConfig.targetEntityAmount]), 10)
                    this.targetData.get(i).enemy ? this.playerScore += 10 : this.playerScore -= 10
                    this.updateCounters()
                    this.isEnemyLeft()
                }
            )
        }
    }

    // TO DO: REFACTOR
    private spawnRandomizer(spawnType: string, entityAmount: number) {
        console.log("GENERATION")
        const generator = ({ firstRow, gap = 1, entityAmountInRow = entityAmount }: { firstRow: boolean, gap?: number | "random", entityAmountInRow?: number }) => {
            let randomGap = false
            if (typeof (gap) === "string") {
                gap = 1
                randomGap = true
            }
            const rowSize = firstRow ? 4 : 5
            const start = entityAmountInRow < 3 ? Math.floor(Math.random() * rowSize) + 1 : 1
            const sequence: number[] = [start]
            let increasing = true
            for (let i = 1; i < entityAmountInRow; i++) {
                if (randomGap) {
                    let randomLimit = 1
                    if (entityAmountInRow >= 3 && firstRow) {
                        randomLimit = 1
                    } else if (entityAmountInRow >= 3) {
                        randomLimit = 2
                    } else randomLimit = 3
                    gap = Math.floor(Math.random() * randomLimit + 1)
                }
                const prev = sequence[i - 1]
                let next
                if (increasing) {
                    next = prev + gap
                    if (next > rowSize) {
                        increasing = false
                        next = start - gap
                        if (next <= 0) next = 1
                    }
                } else next = prev - gap
                sequence.push(next)
            }
            if (!firstRow) sequence.forEach((_, i) => sequence[i] += 4)
            return sequence
        }
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
                console.log('Concat: ', response, spawnType)
                return response
            }
            default:
                throw new Error(`Unknown spawnType: ${spawnType}`)
        }
    }

    private setTexture(entity: Entity, bandit: boolean) {
        const randomTextureIndex = Math.floor(Math.random() * 13) + 1
        const texture = `images/${bandit ? `bandit` : `citizen`}/${randomTextureIndex}.png`
        console.log(texture)
        Material.createOrReplace(entity, {
            material: {
                $case: 'pbr',
                pbr: {
                    texture: {
                        tex: {
                            $case: 'texture',
                            texture: { src: texture }
                        }
                    },
                    emissiveColor: Color4.White(),
                    emissiveIntensity: 0.8,
                    emissiveTexture: {
                        tex: {
                            $case: 'texture',
                            texture: { src: texture }
                        }
                    },
                    roughness: 1.0,
                    specularIntensity: 0,
                    metallic: 0,
                    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
                }
            }
        })
    }

    private spawnEntity() {
        const levelData = levels.get(this.playerLevel)
        const levelTargetsAmount = levelData!.role.reduce((a, b) => a + b, 0)
        console.log("levelTargetsAmount: ", levelTargetsAmount, 'Player Level: ', this.playerLevel)
        const targetPositionArray = this.spawnRandomizer(levelData!.generationType, levelTargetsAmount)
        for (let iterator = 0; iterator < levelTargetsAmount; iterator++) {
            let randomPositionNumber = targetPositionArray[iterator]
            const windowData = this.data.get(`obj_window_${randomPositionNumber}`)
            this.activateWindow(westGameState.availableEntity[randomPositionNumber + westGameConfig.targetEntityAmount * 2 - 1])
            const entity = westGameState.availableEntity[iterator]
            MeshCollider.getMutable(entity).collisionMask = ColliderLayer.CL_POINTER
            VisibilityComponent.getMutable(entity).visible = true
            Transform.createOrReplace(westGameState.availableEntity[iterator + westGameConfig.targetEntityAmount], {
                ...windowData,
                position: { ...windowData.position, y: windowData.position.y - windowData.scale.y / 1.8 },
                parent: sceneParentEntity
            })
            Tween.deleteFrom(westGameState.availableEntity[iterator + westGameConfig.targetEntityAmount])
            Transform.getMutable(westGameState.availableEntity[iterator + westGameConfig.targetEntityAmount]).rotation = Quaternion.fromEulerDegrees(0, 0, 0)
        }
    }

    private activateWindow(entity: Entity) {
        Material.setPbrMaterial(entity, { albedoColor: Color4.Green() })
        utils.timers.setTimeout(() => Tween.createOrReplace(entity, {
            mode: Tween.Mode.Scale({
                start: Transform.get(entity).scale,
                end: { ...Transform.get(entity).scale, y: 0 }
            }),
            duration: this.calculateTime().spawnEntityTweenDuration,
            easingFunction: EasingFunction.EF_EASEINBACK,
        }), 10)
    }

    private refreshWindows() {
        for (let i = 0; i < westGameConfig.targetEntityAmount; i++) {
            Tween.deleteFrom(westGameState.availableEntity[i + westGameConfig.targetEntityAmount * 2])
            Transform.getMutable(westGameState.availableEntity[i + westGameConfig.targetEntityAmount * 2]).scale = westGameState.curtainsScale
        }
    }

    private hitEntity(entity: Entity) {
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Rotate({
                start: Transform.get(entity).rotation,
                end: Quaternion.fromEulerDegrees(-90, 1, 1),

            }),
            duration: this.calculateTime().hitEntityTweenDuration,
            easingFunction: EasingFunction.EF_EASEINBACK,
        });
    }

    private async isEnemyLeft() {
        let enemyLeftCounter = 0
        this.targetData.forEach(data => { if (data.enemy && !data.dead) enemyLeftCounter++ })
        const enemyLeft = enemyLeftCounter == 0
        if (enemyLeft && this.playerHP > 0) {
            this.setPlayerLevel()
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
        this.stopRoundTimers.forEach(el => utils.timers.clearTimeout(el))
        const levelTargetAmount = levels.get(this.playerLevel)!.role.reduce((a, b) => a + b, 0)
        let timerCouter = 0
        engine.addSystem(() => {
            if (timerCouter >= levelTargetAmount) {
                engine.removeSystem('roundEndSystem')
                resolveReady()
                this.refreshWindows()
            }
        }, 1, 'roundEndSystem')
        // TO DO REFACTOR
        for (let i = levelTargetAmount; i < westGameConfig.targetEntityAmount; i++) {
            VisibilityComponent.createOrReplace(westGameState.availableEntity[i]).visible = false
            pointerEventsSystem.removeOnPointerDown(westGameState.availableEntity[i])
            MeshCollider.getMutable(westGameState.availableEntity[i]).collisionMask = ColliderLayer.CL_PHYSICS
        }
        for (let i = 0; i < levelTargetAmount; i++) {
            MeshCollider.getMutable(westGameState.availableEntity[i]).collisionMask = ColliderLayer.CL_PHYSICS
            pointerEventsSystem.removeOnPointerDown(westGameState.availableEntity[i])
            this.hitEntity(westGameState.availableEntity[i + westGameConfig.targetEntityAmount])
            this.stopRoundTimers[i] = utils.timers.setTimeout(() => {
                VisibilityComponent.createOrReplace(westGameState.availableEntity[i]).visible = false
                timerCouter++
            }, !noAnimation ? this.calculateTime().hitEntityTweenDuration + 100 : 1)
        }
        await RoundIsStopped;
    }

    private setPlayerLevel() {
        // TEMP
        this.playerLevel++
        console.log(levels.get(this.playerLevel)?.role)
        if (this.playerLevel >= levels.size) {
            console.log("Infinity level: ", this.playerLevel)
            levels.set(this.playerLevel, this.infinityLevelGenerator())
        }
        console.log("Player Level: ", this.playerLevel)
    }

    private calculateTime() {
        let playerLevelMultiplier = this.playerLevel >= levels.size ? 18 : this.playerLevel
        return {
            endRoundTimeout: westLevelsConfig.initialAppearanceTime - 100 * (playerLevelMultiplier / 3) + westLevelsConfig.initialAppearanceTime / playerLevelMultiplier * 2 + 700,
            spawnEntityTweenDuration: westLevelsConfig.initialAppearanceTime / playerLevelMultiplier + 200,
            hitEntityTweenDuration: 200,
            stopRound: westLevelsConfig.initialAppearanceTime / playerLevelMultiplier + 100
        }
    }

    private infinityLevelGenerator() {
        const randomTargetAmount = Math.floor(Math.random() * 3) + 3
        const enemyAmount = Math.floor(Math.random() * (randomTargetAmount - 1)) + 1
        const nonEnemyAmount = randomTargetAmount - enemyAmount
        console.log('randomTargetAmount: ', randomTargetAmount, 'randomEnemyAmount: ', enemyAmount, "nonEnemyAmount: ", nonEnemyAmount)
        return { role: [enemyAmount, nonEnemyAmount], generationType: 'twoLevels' }
    }

    public resetData() {
        this.endRoundTimeout = 0
        this.playerLevel = 1
        this.playerHP = westGameConfig.playerMaxHP
        this.playerScore = 0
        this.updateCounters()
        this.targetData.clear()
    }

    private setPlayerData() {
        this.playerData = {score: this.playerScore, level: this.playerLevel, time: Date.now() - this.playerData.time}
    }

    public async stopGame() {
        await this.stopRound()
        this.setPlayerData()
        this.resetData()
        this.resolveReady()
    }
}