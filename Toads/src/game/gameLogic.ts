import * as utils from '@dcl-sdk/utils'
import { ColliderLayer, EasingFunction, engine, Entity, GltfContainer, Material, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, RaycastQueryType, raycastSystem, TextShape, Transform, Tween, TweenLoop, TweenSequence, TweenStateStatus, tweenSystem, VisibilityComponent, CameraModeArea, CameraType } from "@dcl/sdk/ecs"
import { animationConfig, soundConfig, toadsGameConfig } from "../config"
import { toadsGameState } from "../state"
import { Vector3, Color4 } from "@dcl/sdk/math"
import { frog01, frog02, hammer } from "../resources/resources"
import { soundManager } from '../globals'
import { TweenState as TweenStateGetter } from '@dcl/ecs/dist/components/generated/index.gen'

const TweenState = TweenStateGetter(engine)

interface EntityObject {
    entity: Entity,
    available: boolean
}

export class GameLogic {
    private availableEntity = new Map()
    private correctSmashCounter = 0
    private miss = 0
    private initialTimeGap = 200
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
        for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) this.availableEntity.set(i + 1, { entity: toadsGameState.availableEntity[i], available: true, hitable: false })
    }

    public resetData() {
        this.correctSmashCounter = 0
        this.miss = 0
        this.initialTimeGap = 900
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
        if(!this.gameEnd) VisibilityComponent.getMutable(hammer).visible = true
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
                    } else if (currentState == TweenStateStatus.TS_COMPLETED) Tween.deleteFrom(hammerEntity)
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
        MeshRenderer.deleteFrom(hammerEntity)
        MeshCollider.deleteFrom(hammerEntity)
        VisibilityComponent.getMutable(hammerEntity).visible = false
    }

    private hitHammer() {
        this.isHammerInAction = true;
        const hammerEntity = toadsGameState.listOfEntity.get('hammer')
        const hammerParent = toadsGameState.listOfEntity.get('hammerParent')
        let currentPosY: number = Transform.get(hammerEntity).position.y + Transform.get(hammerParent).position.y

        raycastSystem.removeRaycasterEntity(engine.CameraEntity)

        Tween.createOrReplace(hammerEntity, {
            mode: Tween.Mode.Move({
                start: Transform.get(hammerEntity).position,
                end: { ...Transform.get(hammerEntity).position, y: toadsGameState.toadInitialHeight - Transform.get(hammerParent).position.y }
            }),
            duration: animationConfig.hitTIme,
            easingFunction: EasingFunction.EF_EASEINQUAD,
        })

        const hammerFinish = () => {
            engine.removeSystem('hammerHit')
            this.activateHammer()
            Tween.deleteFrom(hammerEntity)
            this.isHammerInAction = false
            hammerBounce()
        }

        engine.addSystem(() => {
            const distanceTOLastPoint = -(Transform.get(hammerEntity).position.y + Transform.get(hammerParent).position.y - currentPosY)
            currentPosY = Transform.get(hammerEntity).position.y + Transform.get(hammerParent).position.y
            let hammerZeroYVector = { ...Transform.get(hammerParent).position, y: 0 }
            if (Transform.get(hammerEntity).position.y + Transform.get(hammerParent).position.y <= toadsGameState.toadInitialHeight + .1) {
                soundManager.playSound('missSound', soundConfig.volume)
                this.changeCounter(-1)
                hammerFinish()
            }
            for (const obj of this.availableEntity.values()) {
                const entityPosition = { ...utils.getWorldPosition(obj.entity), y: 0 };
                const distance = Vector3.distance(hammerZeroYVector, entityPosition);
                if (
                    (Transform.get(hammerEntity).position.y + Transform.get(hammerParent).position.y <= Transform.get(obj.entity).position.y
                        || currentPosY - distanceTOLastPoint * toadsGameConfig.hammerHitDistMult <= Transform.get(obj.entity).position.y)
                    && distance <= toadsGameConfig.hammerRadius) {
                    if (!obj.hitable) {
                        soundManager.playSound('missSound', soundConfig.volume)
                        this.changeCounter(-1)
                        hammerFinish()
                        break
                    }
                    soundManager.playSound('hitSound', soundConfig.volume)
                    this.changeCounter(1)
                    this.hitEntity(obj)
                    this.toadsTimer.forEach((e, k) => { if (e.entity == obj.entity) utils.timers.clearTimeout(e.finish) })
                    obj.available = false
                    obj.hitable = false
                    hammerFinish()
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
        }
    }

    private hitEntity(target: EntityObject) {
        const entity = target.entity
        GltfContainer.createOrReplace(entity, { src: frog02.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })

        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Move({
                start: Transform.get(entity).position,
                end: { ...Transform.get(entity).position, y: toadsGameState.toadInitialHeight }
            }),
            duration: animationConfig.frogAfterHitHideTime,
            easingFunction: EasingFunction.EF_LINEAR,
        },)

        utils.timers.setTimeout(() => {
            GltfContainer.createOrReplace(entity, { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
            target.available = true
        }, animationConfig.frogAfterHitHideTime)
    }

    private async playGame() {
        const hideEntity = (obj: EntityObject, pos: number) => {
            const entity = obj.entity
            Tween.createOrReplace(entity, {
                mode: Tween.Mode.Move({
                    start: Transform.get(entity).position,
                    end: { ...Transform.get(entity).position, y: toadsGameState.toadInitialHeight }
                }),
                duration: animationConfig.frogEscapeTime,
                easingFunction: EasingFunction.EF_EASEOUTBACK,
            })

            utils.timers.setTimeout(() => {
                GltfContainer.createOrReplace(entity, { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
                obj.available = true
            }, animationConfig.frogEscapeTime)
        }
        console.log(toadsGameState.listOfEntity.get('ground'));
        pointerEventsSystem.onPointerDown(
            {
                entity: toadsGameState.listOfEntity.get('ground'),
                opts: { button: InputAction.IA_POINTER, hoverText: 'SMASH' },
            },
            () => {
                if (this.isHammerInAction) {
                    console.log('Miss BUT HAMMER IN ACTION')
                    return
                }
                this.hitHammer()
            }
        )

        for (let i = 1; i <= 100; i++) {
            this.initialTimeGap = this.initialTimeGap + toadsGameConfig.frogTimeGap
            this.toadsTimer.set(i, {
                start: utils.timers.setTimeout(() => {
                    let random = Math.floor(Math.random() * toadsGameConfig.ToadsAmount) + 1
                    const obj = this.availableEntity.get(random)
                    if (!obj.available) return
                    obj.available = true
                    obj.hitable = true
                    const entity = obj.entity
                    let y = Transform.get(entity).position.y;
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
                        () => {
                            if (this.isHammerInAction) {
                                console.log('CLICKED BUT HAMMER IN ACTION')
                                return
                            }
                            this.hitHammer()
                        }
                    )
                    this.toadsTimer.get(i).finish = utils.timers.setTimeout(() => hideEntity(obj, y), animationConfig.frogStayTime)
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
        CameraModeArea.deleteFrom(engine.PlayerEntity)
        pointerEventsSystem.removeOnPointerDown(toadsGameState.listOfEntity.get('board'))
        pointerEventsSystem.removeOnPointerDown(toadsGameState.listOfEntity.get('ground'))
        this.stopHammer()
        this.gameEnd = true
        this.availableEntity.forEach(obj => Transform.getMutable(obj.entity).position.y = toadsGameState.toadInitialHeight)
        this.toadsTimer.forEach((e, k) => {
            utils.timers.clearTimeout(e.start)
            this.resolveReady()
        })
    }
}