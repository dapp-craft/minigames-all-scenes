import * as utils from "@dcl-sdk/utils"
import { Animator, EasingFunction, engine, Entity, Transform, Tween, tweenSystem, VisibilityComponent } from "@dcl/sdk/ecs";
import { finishCoords, rocketCoords, startCoords } from "./config";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { CartridgeTest, SpawnEntityDelay } from "./Types";
import { entityList, gameState } from "./state";
import { rocketBoard } from ".";
import { gameButtons, nextLevelTimeOut } from "./game/game";

export class gameEntityManager {

    public entityCounter = 0

    private roundCartrige: Map<number, CartridgeTest>
    private spawnEntityDelay: SpawnEntityDelay = { time: 0, random: true }
    private currentWaveStateMaxEntity = 0
    private currentWaveStateEntityCount = 0
    private entityIndex = 1
    private rocketCoordinate = Vector3.create(...rocketCoords)

    private resolveReady!: () => void
    private entityReady!: () => void
    private answerReady!: () => void
    private waveIsDone: Promise<void>
    private entityMoved: Promise<void>
    private answerIsDone: Promise<void>
    private gameEnd: boolean = false

    constructor(roundData: {
        wave: Map<number, CartridgeTest>,
        spawnEntityDelay: { time: number, random?: boolean },
        initialEntityAmount?: number
    }) {
        this.roundCartrige = roundData.wave
        this.spawnEntityDelay = roundData.spawnEntityDelay
        this.entityCounter = roundData.initialEntityAmount ? roundData.initialEntityAmount : 0

        this.waveIsDone = new Promise((res) => { this.resolveReady = res })
        this.entityMoved = new Promise((res) => { this.entityReady = res })
        this.answerIsDone = new Promise((res) => { this.answerReady = res })
    }

    public async startGame() {
        console.log("Start")
        this.gameEnd = false
        utils.timers.setTimeout(async () => {
            rocketBoard.hideBoard()
            for (let i = 1; i <= this.roundCartrige.size; i++) {
                if (this.gameEnd) return;
                let waveData = this.roundCartrige.get(i)!
                Animator.playSingleAnimation(entityList.get('rocket')!, waveData.goOut ? 'idle2' : 'idle1')
                Animator.playSingleAnimation(entityList.get(waveData.goOut ? 'rightBusEntity' : 'leftBusEntity')!, 'idle1')

                this.currentWaveStateMaxEntity = waveData.itemQueue;
                gameState.availableEntity.forEach((e, k) => Tween.deleteFrom(e))
                for (let j = 0; j < waveData.itemQueue; j++) {
                    this.spawnEntity(waveData.goOut);
                    utils.timers.setTimeout(async () => { this.entityReady(); }, this.spawnEntityDelay.random ? 200 : this.spawnEntityDelay.time);
                    await this.entityMoved;
                    this.entityMoved = new Promise(r => this.entityReady = r);
                }
                await this.waveIsDone;
                this.waveIsDone = new Promise(r => this.resolveReady = r)
                this.entityIndex = 1
                console.log(this.entityCounter)
                if (i == this.roundCartrige.size) {
                    rocketBoard.showBoard(0)
                    rocketBoard.setRightCounter(0)
                    gameButtons.forEach((button, i) => button.enable())
                }
            }
            this.answerReady()
            console.log("Res: ", this.entityCounter);
        }, 3000)
        await this.answerIsDone
        this.answerIsDone = new Promise(r => this.answerReady = r)
        console.log(this.entityCounter, this.entityCounter)
        return this.entityCounter;
    }

    private spawnEntity(isOut: boolean) {
        const entity = gameState.availableEntity[this.entityIndex]
        VisibilityComponent.createOrReplace(entity, { visible: true })
        console.log(this.entityIndex)
        this.entityIndex++;
        Transform.createOrReplace(entity,
            {
                position: Vector3.create(...startCoords),
                rotation: Quaternion.create(0, -1, 0, 1),
                scale: Vector3.create(1, 1, 1)
            })
        Tween.deleteFrom(entity)
        utils.timers.setTimeout(() => {
            this.moveEntity(entity, isOut)
        }, 10)
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
        utils.timers.setTimeout(async () => {
            Tween.deleteFrom(entity)
            isOut ? this.entityCounter-- : this.entityCounter++
            this.currentWaveStateEntityCount++
            VisibilityComponent.createOrReplace(entity, { visible: false });
            if (this.currentWaveStateMaxEntity == this.currentWaveStateEntityCount) {
                this.currentWaveStateEntityCount = 0
                utils.timers.setTimeout(async () => { this.resolveReady() }, this.spawnEntityDelay.random ? Math.floor(Math.random() * (this.spawnEntityDelay.time - 1000 + 1)) + 1000 : this.spawnEntityDelay.time);
                Animator.playSingleAnimation(entityList.get('rocket')!, 'stand')
                Animator.playSingleAnimation(entityList.get('leftBusEntity')!, 'stand')
                Animator.playSingleAnimation(entityList.get('rightBusEntity')!, 'stand')
                console.log("Wave is end")
            }
        }, 2100)
    }

    public stopGame() {
        this.gameEnd = true
        this.resolveReady()
        this.answerReady()
        gameState.availableEntity.forEach(entity => VisibilityComponent.createOrReplace(entity, { visible: false }))
        gameState.availableEntity.forEach((e, k) => Tween.deleteFrom(e))
        console.log(nextLevelTimeOut)
        nextLevelTimeOut != undefined && utils.timers.clearTimeout(nextLevelTimeOut)
    }
}
