import * as utils from "@dcl-sdk/utils"
import { EasingFunction, engine, Entity, GltfContainer, MeshRenderer, Transform, Tween, TweenLoop, TweenState, tweenSystem, VisibilityComponent } from "@dcl/sdk/ecs";
import { entityConfig, finishCoords, modelPath, startCoords } from "./config";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { Cartridge, CartridgeTest, SpawnEntityDelay } from "./Types";
import { gameState } from "./state";
import { kitty } from "./resources/resources";

export class gameEntityManager {

    public entityCounter = 0

    private roundCartrige: Map<number, CartridgeTest>
    private spawnEntityDelay: SpawnEntityDelay = { time: 0, random: true }
    private currentWaveStateMaxEntity = 0
    private currentWaveStateEntityCount = 0
    private entityIndex = 1
    private rocketCoordinate = Vector3.create(Transform.get(gameState.rocketWindow!).position.x, Transform.get(gameState.rocketWindow!).position.y, Transform.get(gameState.rocketWindow!).position.z - 1)

    private resolveReady!: () => void
    private entityReady!: () => void
    private waveIsDone: Promise<void>
    private entityMoved: Promise<void>


    constructor(roundData: {
        waves: Map<number, CartridgeTest>,
        spawnEntityDelay: { time: number, random?: boolean },
        initialEntityAmount?: number
    }) {
        this.roundCartrige = roundData.waves
        this.spawnEntityDelay = roundData.spawnEntityDelay
        this.entityCounter = roundData.initialEntityAmount ? roundData.initialEntityAmount : 0

        this.waveIsDone = new Promise((res) => { this.resolveReady = res })
        this.entityMoved = new Promise((res) => { this.entityReady = res })
    }

    public async startGame() {
        console.log("Start")
        gameState.rocketWindow && VisibilityComponent.createOrReplace(gameState.rocketWindow, { visible: false })
        this.initialEntity(this.entityCounter)
        utils.timers.setTimeout(async () => {
            gameState.rocketWindow && VisibilityComponent.createOrReplace(gameState.rocketWindow, { visible: true })
            for (let i = 1; i <= this.roundCartrige.size; i++) {
                let waveData = this.roundCartrige.get(i)!
                this.currentWaveStateMaxEntity = waveData.itemQueue;
                for (let j = 0; j < waveData.itemQueue; j++) {
                    this.spawnEntity("test", waveData.goOut);
                    utils.timers.setTimeout(async () => { this.entityReady(); }, this.spawnEntityDelay.random ? (Math.random() * (this.spawnEntityDelay.time / 10)) + 500 : this.spawnEntityDelay.time);
                    await this.entityMoved;
                    this.entityMoved = new Promise(r => this.entityReady = r);
                }
                await this.waveIsDone;
                this.waveIsDone = new Promise(r => this.resolveReady = r)
                this.entityIndex = 1
                console.log(this.entityCounter)
            }
            this.initialEntity(this.entityCounter)
            gameState.rocketWindow && VisibilityComponent.createOrReplace(gameState.rocketWindow, { visible: false })
            console.log("Res: ", this.entityCounter)
        }, 3000)
    }

    private spawnEntity(modelName: string, isOut: boolean) {
        const entity = gameState.availableEntity[this.entityIndex]
        VisibilityComponent.createOrReplace(entity, { visible: true })
        console.log(this.entityIndex)
        this.entityIndex++;
        GltfContainer.createOrReplace(entity, { src: kitty.src })
        Transform.createOrReplace(entity,
            {
                position: Vector3.create(...startCoords),
                rotation: Quaternion.create(0, -1, 0, 1),
                scale: Vector3.create(1, 1, 1)
            })
        this.moveEntity(entity, isOut);
    }

    private moveEntity(entity: Entity, isOut: boolean) {
        console.log("Move");
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Move({
                start: isOut ? this.rocketCoordinate : Vector3.create(...startCoords),
                end: isOut ? Vector3.create(...finishCoords) : this.rocketCoordinate,
            }),
            duration: 2000,
            easingFunction: EasingFunction.EF_LINEAR,
        })
        engine.addSystem(() => {
            if (tweenSystem.tweenCompleted(entity)) {
                engine.removeSystem(`myEntityMove${entity}`)
                isOut ? this.entityCounter-- : this.entityCounter++
                this.currentWaveStateEntityCount++
                Tween.createOrReplace(entity, {
                    mode: Tween.Mode.Move({
                        start: Transform.get(entity).position,
                        end: Vector3.create(...startCoords)
                    }),
                    duration: 1,
                    easingFunction: EasingFunction.EF_LINEAR,
                })
                VisibilityComponent.createOrReplace(entity, { visible: false });
                if (this.currentWaveStateMaxEntity == this.currentWaveStateEntityCount) {
                    this.currentWaveStateEntityCount = 0
                    utils.timers.setTimeout(async () => { this.resolveReady() }, this.spawnEntityDelay.random ? Math.floor(Math.random() * (this.spawnEntityDelay.time - 1000 + 1)) + 1000 : this.spawnEntityDelay.time);
                    console.log("Wave is end")
                }
            }
        }, 1, `myEntityMove${entity}`);
    }

    private initialEntity(count: number) {
        let x = 0
        let y = 0

        for (let i = 0; i < count; i++) {
            const entity = gameState.availableEntity[i]
            VisibilityComponent.createOrReplace(entity, { visible: true })
            GltfContainer.createOrReplace(entity, { src: kitty.src })
            Transform.createOrReplace(entity, {
                parent: gameState.rocketWindow!,
                position: Vector3.create((x - 2) * entityConfig.spacing, (y - 2) * entityConfig.spacing, -.2),
                scale: Vector3.create(entityConfig.initialEntitySize, entityConfig.initialEntitySize, entityConfig.initialEntitySize)
            })
            x++
            if (x * (entityConfig.initialEntitySize + entityConfig.spacing) > entityConfig.maxRowLength) {
                x = 0
                y++
            }
            console.log(count, entity)
        }
    }

    private getRandomPointOnCircle() {
        const angle = Math.random() * 2 * Math.PI
        const x = Transform.get(gameState.rocketWindow!).position.x + entityConfig.distance * Math.cos(angle)
        const y = Math.abs(Transform.get(gameState.rocketWindow!).position.y * Math.sin(angle)) + entityConfig.distance
        return Vector3.create(x, y, Transform.get(gameState.rocketWindow!).position.z)
    }
}