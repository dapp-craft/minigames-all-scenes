import * as utils from "@dcl-sdk/utils"
import { EasingFunction, engine, Entity, GltfContainer, MeshRenderer, Transform, Tween, TweenLoop, TweenState, tweenSystem, VisibilityComponent } from "@dcl/sdk/ecs";
import { entityAmount, entityConfig, finishCoords, modelPath, startCoords } from "./config";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { Cartridge, CartridgeTest, SpawnEntityDelay } from "./Types";
import { gameState } from "./state";
import { kitty } from "./resources/resources";
import { initialEntity } from "./game/game";
import { rocketBoard } from ".";
import { board } from "./board";

export class gameEntityManager {

    public entityCounter = 0

    private roundCartrige: Map<number, CartridgeTest>
    private spawnEntityDelay: SpawnEntityDelay = { time: 0, random: true }
    private currentWaveStateMaxEntity = 0
    private currentWaveStateEntityCount = 0
    private entityIndex = 1
    private rocketCoordinate = Vector3.create(8, 1, 3)

    private resolveReady!: () => void
    private entityReady!: () => void
    private answerReady!: () => void
    private waveIsDone: Promise<void>
    private entityMoved: Promise<void>
    private answerIsDone: Promise<void>
    private gameEnd: boolean = false

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
        this.answerIsDone = new Promise((res) => { this.answerReady = res })
    }

    public async startGame() {
        console.log("Start")
        utils.timers.setTimeout(async () => {
            initialEntity(0)
            rocketBoard.hideBoard()
            for (let i = 1; i <= this.roundCartrige.size; i++) {
                if (this.gameEnd) return
                let waveData = this.roundCartrige.get(i)!
                this.currentWaveStateMaxEntity = waveData.itemQueue;
                for (let j = 0; j < waveData.itemQueue; j++) {
                    this.spawnEntity("test", waveData.goOut);
                    utils.timers.setTimeout(async () => { this.entityReady(); }, this.spawnEntityDelay.random ? (Math.random() * (this.spawnEntityDelay.time / 100)) + 200 : this.spawnEntityDelay.time);
                    await this.entityMoved;
                    this.entityMoved = new Promise(r => this.entityReady = r);
                }
                await this.waveIsDone;
                this.waveIsDone = new Promise(r => this.resolveReady = r)
                this.entityIndex = 1
                console.log(this.entityCounter)
            }
            this.answerReady()
            console.log("Res: ", this.entityCounter);

        }, 3000)
        await this.answerIsDone
        this.answerIsDone = new Promise(r => this.answerReady = r)
        console.log(this.entityCounter, this.entityCounter)
        return this.entityCounter;
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

    public stopGame() {
        rocketBoard.hideBoard()
        this.gameEnd = true
        this.answerReady()
        gameState.availableEntity.forEach(entity => {
            VisibilityComponent.createOrReplace(entity, { visible: false })
        })
    }

    // private getRandomPointOnCircle() {
    //     const angle = Math.random() * 2 * Math.PI
    //     const x = Transform.get(gameState.rocketWindow!).position.x + entityConfig.distance * Math.cos(angle)
    //     const y = Math.abs(Transform.get(gameState.rocketWindow!).position.y * Math.sin(angle)) + entityConfig.distance
    //     return Vector3.create(x, y, Transform.get(gameState.rocketWindow!).position.z)
    // }
}