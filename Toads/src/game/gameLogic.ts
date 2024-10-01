import * as utils from '@dcl-sdk/utils'
import { ColliderLayer, EasingFunction, engine, Entity, GltfContainer, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, RaycastQueryType, raycastSystem, TextShape, Transform, Tween, TweenLoop, TweenSequence, TweenStateStatus, tweenSystem, VisibilityComponent } from "@dcl/sdk/ecs"
import { animationConfig, soundConfig, toadsGameConfig } from "../config"
import { toadsGameState } from "../state"
import { Vector3 } from "@dcl/sdk/math"
import { frog01, frog02, hammer } from "../resources/resources"
import { soundManager } from '../globals'

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
        this.activateHummer()
        this.playGame()
        this.gameIsDone = new Promise(r => this.resolveReady = r)
        await this.gameIsDone;
        console.log("Finish")
        return { correct: this.correctSmashCounter, miss: this.miss }
    }

    private async initializeEntity() {
        for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) this.availableEntity.set(i + 1, { entity: toadsGameState.availableEntity[i], available: true })
    }

    private resetData() {
        this.correctSmashCounter = 0
        this.miss = 0
        this.initialTimeGap = 900
        this.gameEnd = false
        this.isHammerInAction = false
        TextShape.getMutable(toadsGameState.listOfEntity.get('hits')).text = `Hits \n${0}`
        TextShape.getMutable(toadsGameState.listOfEntity.get('miss')).text = `Misses \n${0}`
        TextShape.getMutable(toadsGameState.listOfEntity.get('counter')).text = `Score \n${0}`
    }

    private activateHummer() {
        const hammerEntity = toadsGameState.listOfEntity.get('hammer')
        GltfContainer.createOrReplace(hammerEntity, hammer)
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
                if (this.isHammerInAction) return
                if (hit.hits.length == 0) {
                    return GltfContainer.deleteFrom(hammerEntity)
                }
                const hitPos = hit.hits[0].position
                if (hitPos == undefined) {
                    return
                }
                GltfContainer.getOrNull(hammerEntity) == null && GltfContainer.createOrReplace(hammerEntity, hammer)
                Transform.createOrReplace(hammerEntity, {
                    position: { ...hitPos, y: toadsGameConfig.hammerAltitude },
                })
            }
        )
    }

    private stopHammer() {
        raycastSystem.removeRaycasterEntity(engine.CameraEntity)
        console.log("Hammer is stoped")
        const hammerEntity = toadsGameState.listOfEntity.get('hammer')
        MeshRenderer.deleteFrom(hammerEntity)
        MeshCollider.deleteFrom(hammerEntity)
        GltfContainer.deleteFrom(hammerEntity)
    }

    private hitHammer() {
        this.isHammerInAction = true;
        const hammerEntity = toadsGameState.listOfEntity.get('hammer')
        const initialHammerPosition = Transform.get(hammerEntity).position
        let target: EntityObject = { entity: toadsGameState.listOfEntity.get('missTarget'), available: true }
        let hammerZeroYVector = { ...Transform.get(hammerEntity).position, y: 0 }

        raycastSystem.removeRaycasterEntity(engine.CameraEntity)


        Tween.createOrReplace(hammerEntity, {
            mode: Tween.Mode.Move({
                start: Transform.get(hammerEntity).position,
                end: { ...Transform.get(hammerEntity).position, y: toadsGameState.toadInitialHeight }
            }),
            duration: animationConfig.hitTIme,
            easingFunction: EasingFunction.EF_EASEINQUAD,
        })

        engine.addSystem(() => {
            for (const obj of this.availableEntity.values()) {
                const entityPosition = { ...utils.getWorldPosition(obj.entity), y: 0 };
                const distance = Vector3.distance(hammerZeroYVector, entityPosition);
                if (Transform.get(hammerEntity).position.y <= toadsGameState.toadInitialHeight + .1) {
                    engine.removeSystem('hammerHit')
                    soundManager.playSound('missSound', soundConfig.volume)
                    this.changeCounter(-1)
                    Tween.deleteFrom(hammerEntity)
                    hammerBounce()
                    break;
                } else if (Transform.get(hammerEntity).position.y <= Transform.get(obj.entity).position.y && distance <= toadsGameConfig.hammerRadius) {
                    engine.removeSystem('hammerHit')
                    soundManager.playSound('hitSound', soundConfig.volume)
                    this.changeCounter(1)
                    this.hitEntity(obj)
                    this.toadsTimer.forEach((e, k) => { if (e.entity == obj.entity) utils.timers.clearTimeout(e.finish) })
                    obj.available = false
                    Tween.deleteFrom(hammerEntity)
                    hammerBounce()
                    break;
                }
            }
        }, 1000, 'hammerHit');

        const hammerBounce = () => {
            console.log("Bounce")
            Tween.createOrReplace(hammerEntity, {
                mode: Tween.Mode.Move({
                    start: Transform.get(hammerEntity).position,
                    end: { ...Transform.get(hammerEntity).position, y: initialHammerPosition.y },
                }),
                duration: animationConfig.hammerBounceTime,
                easingFunction: EasingFunction.EF_EASEOUTBACK,
            })
            engine.addSystem(() => {
                const tweenCompleted = tweenSystem.tweenCompleted(hammerEntity)
                if (tweenCompleted) {
                    if (this.gameEnd) return
                    engine.removeSystem("bounceSystem")
                    this.isHammerInAction = false
                    this.activateHummer()
                    return
                }
            }, 1, "bounceSystem")
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
            this.initialTimeGap = this.initialTimeGap + 1500
            this.toadsTimer.set(i, {
                start: utils.timers.setTimeout(() => {
                    let random = Math.floor(Math.random() * toadsGameConfig.ToadsAmount) + 1
                    const obj = this.availableEntity.get(random)
                    if (!obj.available) return
                    obj.available = false
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
        pointerEventsSystem.removeOnPointerDown(toadsGameState.listOfEntity.get('board'))
        this.stopHammer()
        this.gameEnd = true
        pointerEventsSystem.removeOnPointerDown(toadsGameState.listOfEntity.get('ground'))
        this.availableEntity.forEach(obj => {
            Transform.getMutable(obj.entity).position.y = toadsGameState.toadInitialHeight
        })
        this.toadsTimer.forEach((e, k) => {
            utils.timers.clearTimeout(e.start)
            this.resolveReady()
        })
    }
}