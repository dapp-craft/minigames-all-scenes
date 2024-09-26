import * as utils from '@dcl-sdk/utils'
import { ColliderLayer, EasingFunction, engine, Entity, GltfContainer, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, RaycastQueryType, raycastSystem, Transform, Tween, TweenLoop, TweenSequence, TweenStateStatus, tweenSystem } from "@dcl/sdk/ecs"
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
    private initialTimeGap = 900
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
        this.setTimer()
        this.gameIsDone = new Promise(r => this.resolveReady = r)
        await this.gameIsDone;
        console.log("Finish")
        return { correct: this.correctSmashCounter, miss: this.miss }
    }

    private setTimer() {
        utils.timers.setTimeout(async () => {
            this.stopGame()
        }, toadsGameConfig.gameTime)

    }

    private async initializeEntity() {
        for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) this.availableEntity.set(i + 1, { entity: toadsGameState.availableEntity[i], available: true })
    }

    private resetData() {
        this.correctSmashCounter = 0
        this.miss = 0
        this.initialTimeGap = 900
        this.gameEnd = false
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
            function (hit) {
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
                    rotation: Quaternion.multiply(Quaternion.fromLookAt(Transform.get(hammerEntity).position, Transform.get(engine.PlayerEntity).position), Quaternion.create(-.5, .5, .6, 0.5))
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

    private hitHammer(data: { obj: EntityObject, pos: any } = { obj: { entity: toadsGameState.listOfEntity.get('missTarget'), available: true }, pos: Vector3.create(0, 0, 0) }) {
        this.isHammerInAction = true
        const target = data.obj.entity
        const hammerEntity = toadsGameState.listOfEntity.get('hammer')
        const initialHammerPosition = Transform.get(hammerEntity).position

        let isMissed = target == toadsGameState.listOfEntity.get('missTarget') ? true : false

        if (isMissed) {
            Transform.createOrReplace(target, {
                position: { ...Transform.get(hammerEntity).position }
            })
        }

        raycastSystem.removeRaycasterEntity(engine.CameraEntity)

        Tween.createOrReplace(hammerEntity, {
            mode: Tween.Mode.Rotate({
                start: Transform.get(hammerEntity).rotation,
                end: Quaternion.fromAngleAxis(90, Vector3.create(0, 0, 1))
            }),
            duration: 200,
            easingFunction: EasingFunction.EF_EASEBOUNCE,
        })

        TweenSequence.createOrReplace(hammerEntity, {
            sequence: [
                {
                    mode: Tween.Mode.Move({
                        start: Transform.get(hammerEntity).position,
                        end: { ...Transform.get(hammerEntity).position, y: 1 }
                    }),
                    duration: animationConfig.hitDelay,
                    easingFunction: EasingFunction.EF_EASEOUTEXPO,
                }
            ]
        })

        engine.addSystem(() => {
            const targetPosition = { ...Transform.get(target).position, y: Transform.get(target).position.y + 1 }
            if (Transform.get(hammerEntity).position.y <= targetPosition.y || Transform.get(hammerEntity).position.y <= 1.5) {
                engine.removeSystem('hammerHit')
                Tween.deleteFrom(hammerEntity)
                hammerBounce()
                !isMissed && this.hitEntity(data.obj, data!.pos)
                utils.timers.setTimeout(async () => {
                    this.isHammerInAction = false
                    this.activateHummer()
                }, animationConfig.hammerBounceTime)

            }
        }, 1000, 'hammerHit');

        const hammerBounce = () => {
            console.log("Bounce")
            Tween.createOrReplace(hammerEntity, {
                mode: Tween.Mode.Move({
                    start: { ...initialHammerPosition, y: Transform.get(hammerEntity).position.y },
                    end: initialHammerPosition
                }),
                duration: animationConfig.hammerBounceTime,
                easingFunction: EasingFunction.EF_EASEOUTBACK,
            })
        }
    }

    private hitEntity(obj: EntityObject, pos: number) {
        const entity = obj.entity
        pointerEventsSystem.removeOnPointerDown(entity);
        GltfContainer.createOrReplace(entity, { src: frog02.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })

        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Move({
                start: { ...Transform.get(entity).position, y: toadsGameState.toadInitialHeight },
                end: { ...Transform.get(entity).position, y: pos - 1 }
            }),
            duration: animationConfig.forgHitGoBackTime,
            easingFunction: EasingFunction.EF_LINEAR,
        },)

        utils.timers.setTimeout(() => {
            pointerEventsSystem.removeOnPointerDown(entity)
            GltfContainer.createOrReplace(entity, { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
        }, animationConfig.forgHitGoBackTime)

        TweenSequence.createOrReplace(entity, {
            sequence: [
                {
                    mode: Tween.Mode.Move({
                        start: { ...Transform.get(entity).position, y: pos - 1 },
                        end: { ...Transform.get(entity).position, y: toadsGameState.toadInitialHeight }
                    }),
                    duration: 500,
                    easingFunction: EasingFunction.EF_LINEAR,
                },
            ]
        })
        obj.available = true
    }

    private async playGame() {
        let toadsAppeared = 0
        const hideEntity = (obj: EntityObject, pos: number) => {
            console.log("Hide")
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
            }, animationConfig.frogSkipGoBackTime)
            obj.available = true
        }
        console.log(toadsGameState.listOfEntity.get('ground'));
        pointerEventsSystem.onPointerDown(
            {
                entity: toadsGameState.listOfEntity.get('ground'),
                opts: { button: InputAction.IA_POINTER, hoverText: 'SMASH' },
            },
            () => {
                console.log("Miss")
                this.hitHammer()
                this.miss++
            }
        )

        for (let i = 1; i <= 100; i++) {
            this.initialTimeGap = this.initialTimeGap + 1500
            if (this.gameEnd) console.log("Yo")
            this.toadsTimer.set(i, {
                start: utils.timers.setTimeout(async () => {
                    console.log("Here")
                    let random = Math.floor(Math.random() * toadsGameConfig.ToadsAmount) + 1
                    const obj = this.availableEntity.get(random)
                    if (!obj.available) return
                    obj.available = false
                    const entity = obj.entity
                    let y = Transform.get(entity).position.y;
                    Tween.deleteFrom(entity)
                    toadsAppeared++
                    Tween.createOrReplace(entity, {
                        mode: Tween.Mode.Move({
                            start: Transform.get(entity).position,
                            end: { ...Transform.get(entity).position, y: y + toadsGameConfig.toadsDistance },
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
                            console.log('CLICKED')
                            utils.timers.clearTimeout(this.toadsTimer.get(i).finish);
                            this.hitHammer({ obj: obj, pos: y })
                            this.correctSmashCounter++
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