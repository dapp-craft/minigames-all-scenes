import * as utils from '@dcl-sdk/utils'
import { ColliderLayer, EasingFunction, engine, Entity, GltfContainer, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, RaycastQueryType, raycastSystem, TextShape, Transform, Tween, TweenStateStatus, VisibilityComponent } from "@dcl/sdk/ecs"
import { animationConfig, soundConfig, toadsGameConfig } from "../config"
import { toadsGameState } from "../state"
import { Vector3 } from "@dcl/sdk/math"
import { frog01, frog02 } from "../resources/resources"
import { soundManager } from '../globals'
import { TweenState as TweenStateGetter } from '@dcl/ecs/dist/components/generated/index.gen'

const TweenState = TweenStateGetter(engine)

interface EntityObject {
    entity: Entity,
    available: boolean,
}

export class GameLogic {
    private availableEntity = new Map()
    private correctSmashCounter = 0
    private miss = 0
    private initialTimeGap = toadsGameConfig.initialTimeGap
    private resolveReady!: () => void
    private isHammerInAction = false
    private gameEnd = false
    private gameIsDone: Promise<void>
    private toadsTimer = new Map()

    constructor() {
        this.gameIsDone = new Promise((res) => { this.resolveReady = res })
    }

    public async startGame() {
        this.resetData()
        await this.initializeEntity()
        this.activateHammer()
        this.playGame()
        this.gameIsDone = new Promise(r => this.resolveReady = r)
        await this.gameIsDone;
        this.stopGame()
        console.log("Finish")
        return (this.correctSmashCounter - this.miss) * toadsGameConfig.priceMultiplier
    }

    private async initializeEntity() {
        for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) this.availableEntity.set(i + 1, { entity: toadsGameState.availableEntity[i], available: true })
    }

    public resetData() {
        this.correctSmashCounter = 0
        this.miss = 0
        this.initialTimeGap = toadsGameConfig.initialTimeGap
        this.gameEnd = false
        this.isHammerInAction = false
        TextShape.getMutable(toadsGameState.listOfEntity.get('hits')).text = `Hits \n${0}`
        TextShape.getMutable(toadsGameState.listOfEntity.get('miss')).text = `Misses \n${0}`
        TextShape.getMutable(toadsGameState.listOfEntity.get('counter')).text = `Score \n${0}`
    }

    private activateHammer() {
        console.log("activateHammer")
        const hammerEntity = toadsGameState.listOfEntity.get('hammerParent')
        const hammer = toadsGameState.listOfEntity.get('hammer')
        if (!this.gameEnd) VisibilityComponent.getMutable(hammer).visible = true
        let animStart = 0
        raycastSystem.registerLocalDirectionRaycast(
            {
                entity: engine.CameraEntity,
                opts: {
                    queryType: RaycastQueryType.RQT_HIT_FIRST,
                    direction: Vector3.Forward(),
                    continuous: true,
                    collisionMask: ColliderLayer.CL_CUSTOM5,
                },
            },
            (hit) => {
                if (this.gameEnd) return
                if (hit.hits.length == 0) return
                const hitPos = hit.hits[0].position
                if (hitPos == undefined) return
                let start = Transform.get(hammerEntity).position
                const end = { ...hitPos, y: toadsGameConfig.hammerAltitude }
                if (Vector3.distance(start, end) > animationConfig.hammerSpeed / 30) {
                    const tween = Tween.getOrNull(hammerEntity)?.mode
                    const currentState = TweenState.getOrNull(hammerEntity)?.state
                    if (currentState == TweenStateStatus.TS_ACTIVE && tween?.$case == 'move') {
                        const currentPosition = Math.max(Tween.get(hammerEntity).currentTime!, TweenState.get(hammerEntity).currentTime)
                        let calculatedStart = Vector3.add(
                            tween.move.start!,
                            Vector3.scale(
                                Vector3.subtract(tween.move.end!, tween.move.start!),
                                currentPosition + 50 * animationConfig.hammerSpeed / 1000 / Vector3.distance(tween.move.end!, tween.move.start!)
                            )
                        )
                        if (Vector3.distance(tween.move.end!, end) < 0.01) return

                        // ERRATA: moving path start away because Tween currentTime is not updated
                        if (currentPosition < 0.99) {
                            const extendedPath = Vector3.scale(Vector3.subtract(end, calculatedStart), 1 / (1 - currentPosition))
                            calculatedStart = Vector3.subtract(end, extendedPath)
                        }
                        start = calculatedStart
                        Tween.createOrReplace(hammerEntity, {
                            mode: Tween.Mode.Move({ start, end })!,
                            duration: 1000 * Vector3.distance(start, end) / animationConfig.hammerSpeed,
                            easingFunction: EasingFunction.EF_LINEAR,
                            currentTime: currentPosition
                        })
                    } else if (!Tween.has(hammerEntity)) {
                        Tween.createOrReplace(hammerEntity, {
                            mode: Tween.Mode.Move({ start, end }),
                            duration: 1000 * Vector3.distance(start, end) / animationConfig.hammerSpeed,
                            easingFunction: EasingFunction.EF_LINEAR,
                            currentTime: 0
                        })
                        animStart = Date.now()
                    } else if (Date.now() - animStart > 50) Tween.deleteFrom(hammerEntity)
                } else {
                    Tween.deleteFrom(hammerEntity)
                    Transform.createOrReplace(hammerEntity, { position: end })
                }
            }
        )
    }

    private stopHammer() {
        raycastSystem.removeRaycasterEntity(engine.CameraEntity)
        console.log("Hammer is stoped")
        const hammerEntity = toadsGameState.listOfEntity.get('hammer')
        const hammerParent = toadsGameState.listOfEntity.get('hammer')
        MeshRenderer.deleteFrom(hammerEntity)
        MeshCollider.deleteFrom(hammerEntity)
        Tween.deleteFrom(hammerParent)
        VisibilityComponent.getMutable(hammerEntity).visible = false
    }

    private hitHammer() {
        if (this.isHammerInAction) return
        this.isHammerInAction = true;
        const hammerEntity = toadsGameState.listOfEntity.get('hammer')
        const hammerParent = toadsGameState.listOfEntity.get('hammerParent')
        let currentPosY: number = Transform.get(hammerEntity).position.y + Transform.get(hammerParent).position.y

        raycastSystem.removeRaycasterEntity(engine.CameraEntity)

        Tween.createOrReplace(hammerEntity, {
            mode: Tween.Mode.Move({
                start: Transform.get(hammerEntity).position,
                end: { ...Transform.get(hammerEntity).position, y: toadsGameState.toadInitialHeight - Transform.get(hammerParent).position.y + .4 }
            }),
            duration: animationConfig.hitTIme,
            easingFunction: EasingFunction.EF_EASEINQUAD,
        })

        const hammerFinish = () => {
            engine.removeSystem('hammerHit')
            this.activateHammer()
            Tween.deleteFrom(hammerEntity)
            hammerBounce()
        }

        engine.addSystem(() => {
            const distanceTOLastPoint = -(Transform.get(hammerEntity).position.y + Transform.get(hammerParent).position.y - currentPosY)
            currentPosY = Transform.get(hammerEntity).position.y + Transform.get(hammerParent).position.y
            let hammerZeroYVector = { ...Transform.get(hammerParent).position, y: 0 }
            if (Transform.get(hammerEntity).position.y + Transform.get(hammerParent).position.y <= toadsGameState.toadInitialHeight + .6) {
                soundManager.playSound('missSound', soundConfig.volume)
                this.changeCounter(-1)
                hammerFinish()
                return
            }
            for (const obj of this.availableEntity.values()) {
                const entityPosition = { ...utils.getWorldPosition(obj.entity), y: 0 };
                const distance = Vector3.distance(hammerZeroYVector, entityPosition);
                if (
                    (Transform.get(hammerEntity).position.y + Transform.get(hammerParent).position.y <= Transform.get(obj.entity).position.y
                        || currentPosY - distanceTOLastPoint * toadsGameConfig.hammerHitDistMult <= Transform.get(obj.entity).position.y)
                    && distance <= toadsGameConfig.hammerRadius
                ) {
                    soundManager.playSound('hitSound', soundConfig.volume)
                    hammerFinish()
                    this.changeCounter(1)
                    this.hideEntity(obj, true)
                    this.toadsTimer.forEach((e, k) => { if (e.entity == obj.entity) utils.timers.clearTimeout(e.finish) })
                    break;
                }
            }
        }, 1000, 'hammerHit');

        const hammerBounce = () => {
            console.log("Bounce")
            Tween.createOrReplace(hammerEntity, {
                mode: Tween.Mode.Move({
                    start: { ...Transform.get(hammerEntity).position, },
                    end: Vector3.Zero(),
                }),
                duration: animationConfig.hammerBounceTime,
                easingFunction: EasingFunction.EF_EASEOUTBACK,
            })
            utils.timers.setTimeout(() => { this.isHammerInAction = false }, 100)
        }
    }

    private hideEntity(target: EntityObject, hit: boolean) {
        const entity = target.entity
        hit && GltfContainer.createOrReplace(entity, { src: frog02.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })

        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Move({
                start: Transform.get(entity).position,
                end: { ...Transform.get(entity).position, y: toadsGameState.toadInitialHeight }
            }),
            duration: hit ? animationConfig.frogAfterHitHideTime : animationConfig.frogEscapeTime,
            easingFunction: EasingFunction.EF_LINEAR,
        },)

        utils.timers.setTimeout(() => {
            GltfContainer.createOrReplace(entity, { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
            target.available = true
        }, animationConfig.frogAfterHitHideTime)
    }

    private async playGame() {
        pointerEventsSystem.onPointerDown(
            {
                entity: toadsGameState.listOfEntity.get('ground'),
                opts: { button: InputAction.IA_POINTER, hoverText: 'SMASH' },
            },
            () => this.hitHammer()
        )

        for (let i = 1; i <= 100; i++) {
            this.initialTimeGap = this.initialTimeGap + toadsGameConfig.frogTimeGap
            this.toadsTimer.set(i, {
                start: utils.timers.setTimeout(() => {
                    let random = Math.floor(Math.random() * toadsGameConfig.ToadsAmount) + 1
                    const obj = this.availableEntity.get(random)
                    if (!obj.available) return
                    obj.available = false
                    const entity = obj.entity
                    Tween.deleteFrom(entity)
                    Tween.createOrReplace(entity, {
                        mode: Tween.Mode.Move({
                            start: Transform.get(entity).position,
                            end: { ...Transform.get(entity).position, y: toadsGameState.toadFinishHeight },
                        }),
                        duration: 100,
                        easingFunction: EasingFunction.EF_EASEOUTBACK,
                    })
                    pointerEventsSystem.onPointerDown(
                        {
                            entity: entity,
                            opts: { button: InputAction.IA_POINTER, hoverText: 'SMASH' },
                        },
                        () => this.hitHammer()
                    )
                    this.toadsTimer.get(i).finish = utils.timers.setTimeout(() => this.hideEntity(obj, false), animationConfig.frogStayTime)
                    this.toadsTimer.get(i).entity = entity
                }, this.initialTimeGap)
            })
        }
    }

    private changeCounter(number: number) {
        if (number >= 0) {
            this.correctSmashCounter++
            TextShape.getMutable(toadsGameState.listOfEntity.get('hits')).text = `Hits \n${this.correctSmashCounter}`
        } else {
            this.miss++
            TextShape.getMutable(toadsGameState.listOfEntity.get('miss')).text = `Misses \n${this.miss}`
        }
        TextShape.getMutable(toadsGameState.listOfEntity.get('counter')).text = `Score \n${(this.correctSmashCounter - this.miss) * toadsGameConfig.priceMultiplier}`
    }

    public stopGame() {
        console.log("Game is stopped")
        pointerEventsSystem.removeOnPointerDown(toadsGameState.listOfEntity.get('board'))
        pointerEventsSystem.removeOnPointerDown(toadsGameState.listOfEntity.get('ground'))
        this.stopHammer()
        this.gameEnd = true
        this.availableEntity.forEach(obj => {
            Tween.createOrReplace(obj.entity, {
                mode: Tween.Mode.Move({
                    start: { ...Transform.get(obj.entity).position, y: toadsGameState.toadInitialHeight },
                    end: { ...Transform.get(obj.entity).position, y: toadsGameState.toadInitialHeight },
                }),
                duration: 10,
                easingFunction: EasingFunction.EF_LINEAR,
            })
        })
        this.toadsTimer.forEach((e, k) => {
            utils.timers.clearTimeout(e.start)
            this.resolveReady()
        })
    }
}