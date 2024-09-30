import * as utils from '@dcl-sdk/utils'
import { ColliderLayer, EasingFunction, engine, Entity, GltfContainer, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, RaycastQueryType, raycastSystem, TextShape, Transform, Tween, TweenLoop, TweenSequence, TweenStateStatus, tweenSystem, VisibilityComponent } from "@dcl/sdk/ecs"
import { animationConfig, toadsGameConfig } from "../config"
import { toadsGameState } from "../state"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { frog01, frog02, hammer } from "../resources/resources"

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
        TextShape.getMutable(toadsGameState.listOfEntity.get('counter')).text = `${this.correctSmashCounter - this.miss}`
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
        TextShape.getMutable(toadsGameState.listOfEntity.get('hits')).text = `${0}`
        TextShape.getMutable(toadsGameState.listOfEntity.get('miss')).text = `${0}`
        TextShape.getMutable(toadsGameState.listOfEntity.get('counter')).text = `${0}`
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
                    // return
                }
                const hitPos = hit.hits[0].position
                if (hitPos == undefined) {
                    return
                }
                GltfContainer.getOrNull(hammerEntity) == null && GltfContainer.createOrReplace(hammerEntity, hammer)
                Transform.createOrReplace(hammerEntity, {
                    position: { ...hitPos, y: 3 },
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
        let isMissed = false;
        let target: EntityObject = { entity: toadsGameState.listOfEntity.get('missTarget'), available: true }
        let hammerZeroYVector = { ...Transform.get(hammerEntity).position, y: 0 }

        raycastSystem.removeRaycasterEntity(engine.CameraEntity)

        for (const obj of this.availableEntity.values()) {
            const entityPosition = { ...utils.getWorldPosition(obj.entity), y: 0 };
            const distance = Vector3.distance(hammerZeroYVector, entityPosition);
            if (distance <= toadsGameConfig.hammerRadius) {
                console.log("Hit", distance);
                target = obj;
                isMissed = false;
                break;
            } else {
                console.log("Miss");
                isMissed = true;
            }
        }

        if (isMissed) {
            this.miss++
            TextShape.getMutable(toadsGameState.listOfEntity.get('miss')).text = `${this.miss}`
        } else {
            this.correctSmashCounter++
            TextShape.getMutable(toadsGameState.listOfEntity.get('hits')).text = `${this.correctSmashCounter}`
            target.available = false
        }

        Tween.createOrReplace(hammerEntity, {
            mode: Tween.Mode.Move({
                start: Transform.get(hammerEntity).position,
                end: { ...Transform.get(hammerEntity).position, y: toadsGameState.toadInitialHeight }
            }),
            duration: animationConfig.hitDelay,
            easingFunction: EasingFunction.EF_EASEOUTEXPO,
        })

        engine.addSystem(() => {
            if (Transform.get(hammerEntity).position.y <= Transform.get(target.entity).position.y || Transform.get(hammerEntity).position.y <= 1) {
                Tween.deleteFrom(hammerEntity)
                engine.removeSystem('hammerHit')
                hammerBounce()
                !isMissed && this.hitEntity(target)
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
        pointerEventsSystem.removeOnPointerDown(entity);
        GltfContainer.createOrReplace(entity, { src: frog02.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })

        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Move({
                start: Transform.get(entity).position,
                end: { ...Transform.get(entity).position, y: toadsGameState.toadInitialHeight }
            }),
            duration: animationConfig.forgHitGoBackTime,
            easingFunction: EasingFunction.EF_LINEAR,
        },)

        utils.timers.setTimeout(() => {
            pointerEventsSystem.removeOnPointerDown(entity)
            GltfContainer.createOrReplace(entity, { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
            target.available = true
        }, animationConfig.forgHitGoBackTime)
    }

    private async playGame() {
        const hideEntity = (obj: EntityObject, pos: number) => {
            const entity = obj.entity
            Tween.createOrReplace(entity, {
                mode: Tween.Mode.Move({
                    start: Transform.get(entity).position,
                    end: { ...Transform.get(entity).position, y: toadsGameState.toadInitialHeight }
                }),
                duration: animationConfig.frogSkipGoBackTime,
                easingFunction: EasingFunction.EF_EASEOUTBACK,
            })

            utils.timers.setTimeout(() => {
                pointerEventsSystem.removeOnPointerDown(entity)
                GltfContainer.createOrReplace(entity, { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
                obj.available = true
            }, animationConfig.frogSkipGoBackTime)
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
                start: utils.timers.setTimeout(async () => {
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
                            end: { ...Transform.get(entity).position, y: toadsGameState.toadInitialHeight + toadsGameConfig.toadsDistance },
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
                }, this.initialTimeGap)
            })
        }
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