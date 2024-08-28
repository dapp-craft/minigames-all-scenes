import * as utils from "@dcl-sdk/utils"
import { EasingFunction, engine, Entity, GltfContainer, MeshRenderer, Transform, Tween, TweenLoop, TweenState, tweenSystem, VisibilityComponent } from "@dcl/sdk/ecs";
import { entityConfig, modelPath } from "./config";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { Cartridge, CartridgeTest, SpawnEntityDelay } from "./Types";
import { gameState } from "./state";

export class gameEntityManager {

    public entityCounter = 0

    private roundCartrige: Map<number, CartridgeTest>
    private spawnEntityDelay: SpawnEntityDelay = { time: 0, random: true }
    private currentWaveStateMaxEntity = 0
    private currentWaveStateEntityCount = 0
    private entityIndex = 1
    private rocketCoordinate = Vector3.create(Transform.get(gameState.rocketWindow!).position.x, Transform.get(gameState.rocketWindow!).position.y, Transform.get(gameState.rocketWindow!).position.z)

    private resolveReady!: () => void
    private entityReady!: () => void
    private waveIsDone: Promise<void>
    private entityMoved: Promise<void>


    constructor(roundData: {
        cartridge: Map<number, CartridgeTest> | false,
        spawnEntityDelay: { time: number, random?: boolean },
        initialEntityAmount?: number
    }) {
        this.roundCartrige = roundData.cartridge ? roundData.cartridge : this.generateCartrige()
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
                this.currentWaveStateMaxEntity = waveData.itemQueue
                for(let j = 0; j < waveData.itemQueue; j++) {
                    this.spawnEntity("test", waveData.goOut);
                    await this.entityMoved;
                    this.entityMoved = new Promise(r => this.entityReady = r)
                }
                await this.waveIsDone;
                this.waveIsDone = new Promise(r => this.resolveReady = r);
                console.log("Wave is end")
                this.entityIndex = 1
            }
            console.log("Res: ", this.entityCounter)
        }, 3000)
    }

    private generateCartrige() {
        // TODO logic
        const generatedCartrige = new Map([[1, { itemQueue: 3, goOut: false }]])
        return generatedCartrige
    }

    private spawnEntity(modelName: string, isOut: boolean) {
        const entity = gameState.availableEntity[this.entityIndex]
        VisibilityComponent.createOrReplace(entity, { visible: true })
        console.log(this.entityIndex)
        this.entityIndex++
        GltfContainer.createOrReplace(entity, { src: modelPath.get(modelName)! })
        Transform.createOrReplace(entity,
            {
                position: Vector3.create(1, 1, 1),
                rotation: Quaternion.Zero(),
                scale: Vector3.create(1, 1, 1)
            })
        MeshRenderer.setBox(entity) ///
        this.moveEntity(entity, isOut);
    }

    private moveEntity(entity: Entity, isOut: boolean) {
        console.log("Move");
        const random = this.getRandomPointOnCircle();
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Move({
                start: isOut ? this.rocketCoordinate : random,
                end: isOut ? random : this.rocketCoordinate,
            }),
            duration: 2000,
            easingFunction: EasingFunction.EF_LINEAR,
        })
        engine.addSystem(() => {
            if (tweenSystem.tweenCompleted(entity)) {
                engine.removeSystem(`myEntityMove${entity}`)
                isOut ? this.entityCounter-- : this.entityCounter++
                this.currentWaveStateEntityCount++
                VisibilityComponent.createOrReplace(entity, { visible: false })
                utils.timers.setTimeout(async () => {this.entityReady();}, this.spawnEntityDelay.random ? Math.floor(Math.random() * (this.spawnEntityDelay.time - 1000 + 1)) + 1000 : this.spawnEntityDelay.time);
                if (this.currentWaveStateMaxEntity == this.currentWaveStateEntityCount) {
                    this.currentWaveStateEntityCount = 0
                    this.resolveReady()
                }
            }
        }, 1, `myEntityMove${entity}`)
    }

     private initialEntity(count: number) {
        let x = 0
        let y = 0

        for (let i = 0; i < count; i++) {
            const entity = gameState.availableEntity[i]
            Transform.createOrReplace(entity, {
                parent: gameState.rocketWindow!,
                position: Vector3.create((x - 2) * entityConfig.spacing, (y - 2) * entityConfig.spacing, -.2),
                scale: Vector3.create(entityConfig.initialEntitySize, entityConfig.initialEntitySize, entityConfig.initialEntitySize)
            })
            MeshRenderer.setBox(entity)
            x++
            if (x * (entityConfig.initialEntitySize + entityConfig.spacing) > entityConfig.maxRowLength) {
                x = 0
                y++
            }
        }
    }

    private getRandomPointOnCircle() {
        const angle = Math.random() * 2 * Math.PI
        const x = Transform.get(gameState.rocketWindow!).position.x + entityConfig.distance * Math.cos(angle)
        const y = Math.abs(Transform.get(gameState.rocketWindow!).position.y * Math.sin(angle)) + entityConfig.distance
        return Vector3.create(x, y, Transform.get(gameState.rocketWindow!).position.z)
    }
}