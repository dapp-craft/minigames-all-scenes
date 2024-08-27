import * as utils from "@dcl-sdk/utils"
import { EasingFunction, engine, Entity, GltfContainer, MeshRenderer, Transform, Tween, TweenLoop, TweenState, tweenSystem, VisibilityComponent } from "@dcl/sdk/ecs";
import { modelPath } from "./config";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { Cartridge, SpawnEntityDelay } from "./Types";
import { gameState } from "./state";

export class gameEntityManager {

    public entityCounter = 0

    private roundCartrige: Map<number, Cartridge>
    private spawnEntityDelay: SpawnEntityDelay = { time: 0, random: true }
    private currentWaveStateMaxEntity = 0
    private currentWaveStateEntityCount = 0
    private entityIndex = 1

    private resolveReady!: () => void
    private waveIsDone: Promise<void>

    constructor(roundData: {
        cartridge: Map<number, Cartridge> | false,
        spawnEntityDelay: { time: number, random?: boolean },
        initialEntityAmount?: number
    }) {
        this.roundCartrige = roundData.cartridge ? roundData.cartridge : this.generateCartrige()
        this.spawnEntityDelay = roundData.spawnEntityDelay
        this.entityCounter = roundData.initialEntityAmount ? roundData.initialEntityAmount : 0

        this.waveIsDone = new Promise((res) => { this.resolveReady = res })
    }

    public async startGame() {
        console.log("Start")
        for (let i = 1; i <= this.roundCartrige.size; i++) {
            let waveData = this.roundCartrige.get(i)!
            this.currentWaveStateMaxEntity = waveData.itemQueue.length
            waveData.itemQueue.forEach((entityName: any) => {
                utils.timers.setTimeout(() => {
                    this.spawnEntity(entityName, waveData.goOut)
                }, this.spawnEntityDelay.random ? Math.floor(Math.random() * (this.spawnEntityDelay.time - this.spawnEntityDelay.time / 100 + 1)) + this.spawnEntityDelay.time / 100 : this.spawnEntityDelay.time)
            })
            await this.waveIsDone;
            this.waveIsDone = new Promise(r => this.resolveReady = r);
            console.log("Wave is end")
            this.entityIndex = 1
        }
        console.log("Res: ", this.entityCounter)
    }

    private generateCartrige() {
        // TODO logic
        const generatedCartrige = new Map([[1, { itemQueue: ["1"], goOut: false }]])
        return generatedCartrige
    }

    private spawnEntity(modelName: string, isOut: boolean) {
        // const entity = engine.addEntity()
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
        // TODO refactor
        console.log("Move");
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Move({
                start: isOut ? Vector3.create(1, 1, 8) : Vector3.create(8, 1, 1),
                end: isOut ? Vector3.create(8, 1, 1) : Vector3.create(1, 1, 8),
            }),
            duration: 2000,
            easingFunction: EasingFunction.EF_LINEAR,
        })
        Tween.getMutable(entity).playing = true

        engine.addSystem(() => {
            if (tweenSystem.tweenCompleted(entity)) {
                engine.removeSystem(`myEntityMove${entity}`)
                isOut ? this.entityCounter-- : this.entityCounter++
                this.currentWaveStateEntityCount++
                VisibilityComponent.createOrReplace(entity, { visible: false })
                Tween.createOrReplace(entity, {
                    mode: Tween.Mode.Move({
                        start: !isOut ? Vector3.create(1, 1, 8) : Vector3.create(8, 1, 1),
                        end: !isOut ? Vector3.create(8, 1, 1) : Vector3.create(1, 1, 8),
                    }),
                    duration: 1,
                    easingFunction: EasingFunction.EF_LINEAR,
                })
                if (this.currentWaveStateMaxEntity == this.currentWaveStateEntityCount) {
                    this.currentWaveStateEntityCount = 0
                    this.resolveReady()
                }
            }
        }, 1, `myEntityMove${entity}`)
    }
}