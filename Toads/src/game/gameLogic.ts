import * as utils from '@dcl-sdk/utils'
import { ColliderLayer, EasingFunction, engine, Entity, GltfContainer, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, RaycastQueryType, raycastSystem, Transform, Tween, TweenLoop, TweenSequence, TweenStateStatus, tweenSystem } from "@dcl/sdk/ecs"
import { animationConfig, toadsGameConfig } from "../config"
import { toadsGameState } from "../state"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { frog01, frog02, hammer } from "../resources/resources"

export class GameLogic {
    private availableEntity = new Map()
    private correctSmashCounter = 0
    private mistakeSmashCounter = 0
    private miss = 0
    private toadsAmount = 0
    private initialTimeGap = 900
    private additionTimeGap = 1000
    private resolveReady!: () => void
    private toadQueueReady!: () => void

    private gameIsDone: Promise<void>
    private toadQueueIsDone: Promise<void>

    private toadsTimer = new Map()

    constructor() {
        this.gameIsDone = new Promise((res) => { this.resolveReady = res })
        this.toadQueueIsDone = new Promise(r => this.toadQueueReady = r)
    }

    public async startGame() {
        this.resetData()
        await this.initializeEntity()
        this.calculateToads()
        console.log(this.toadsAmount)
        this.activateHummer()
        this.playGame()
        this.gameIsDone = new Promise(r => this.resolveReady = r)
        await this.gameIsDone;
        console.log("Finish")
        return { correct: this.correctSmashCounter, mistake: this.mistakeSmashCounter, miss: this.miss }
    }

    private async initializeEntity() {
        for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) this.availableEntity.set(i + 1, toadsGameState.availableEntity[i])
    }

    private calculateToads() { this.toadsAmount = Math.floor((toadsGameConfig.gameTime - this.initialTimeGap) / (this.additionTimeGap * 2)) }

    private resetData() {
        this.correctSmashCounter = 0
        this.mistakeSmashCounter = 0
        this.miss = 0
        this.toadsAmount = 0
        this.initialTimeGap = 900
    }

    private activateHummer() {
        const hammerEntity = toadsGameState.listOfEntity.get('hammer')
        // Tween.deleteFrom(hammerEntity)
        GltfContainer.createOrReplace(hammerEntity, hammer)
        raycastSystem.registerLocalDirectionRaycast(
            {
                entity: engine.CameraEntity,
                opts: {
                    queryType: RaycastQueryType.RQT_HIT_FIRST,
                    direction: Vector3.Forward(),
                    continuous: true,
                    collisionMask: ColliderLayer.CL_CUSTOM5,
                    maxDistance: 6,
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
                    position: { ...hitPos, y: hitPos.y + 2 },
                    rotation: Quaternion.multiply(Quaternion.fromLookAt(Transform.get(hammerEntity).position, Transform.get(engine.PlayerEntity).position), Quaternion.create(-.5, .5, .6, 0.5))
                })

                // Transform.getMutable(hammerEntity).position = { ...hitPos, y: hitPos.y + 2 }
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

    private hitHammer(data: { target: Entity, pos: any } = { target: toadsGameState.listOfEntity.get('missTarget'), pos: Vector3.create(0, 0, 0) }) {
        const hammerEntity = toadsGameState.listOfEntity.get('hammer')
        const initialHammerPosition = Transform.get(hammerEntity).position

        let isMissed = data.target == toadsGameState.listOfEntity.get('missTarget') ? true : false

        if (isMissed) {
            Transform.createOrReplace(data.target, {
                position: { ...Transform.get(hammerEntity).position}
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
            const targetPosition = { ...Transform.get(data!.target).position, y: Transform.get(data!.target).position.y + 1 }
            if (Transform.get(hammerEntity).position.y <= targetPosition.y || Transform.get(hammerEntity).position.y <= 1.5) {
                engine.removeSystem('hammerHit')
                Tween.deleteFrom(hammerEntity)
                hammerBounce()
                !isMissed && this.hitEntity(data!.target, data!.pos)
                this.activateHummer()
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

    private hitEntity(entity: Entity, pos: number) {
        pointerEventsSystem.removeOnPointerDown(entity);
        Tween.createOrReplace(entity, {
            mode: Tween.Mode.Move({
                start: { ...Transform.get(entity).position, y: Transform.get(entity).position.y - .3 },
                end: { ...Transform.get(entity).position, y: pos - 1 }
            }),
            duration: animationConfig.forgHitGoBackTime,
            easingFunction: EasingFunction.EF_LINEAR,
        },)
        GltfContainer.createOrReplace(entity, { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
        TweenSequence.createOrReplace(entity, {
            sequence: [
                {
                    mode: Tween.Mode.Move({
                        start: { ...Transform.get(entity).position, y: pos - 1 },
                        end: { ...Transform.get(entity).position, y: pos }
                    }),
                    duration: 500,
                    easingFunction: EasingFunction.EF_LINEAR,
                },
            ]
        })

        this.toadsAmount--
        console.log(this.toadsAmount)
        if (this.toadsAmount == 0) this.stopGame()
    }

    private async playGame() {
        let toadsAppeared = 0

        const hideEntity = (entity: Entity, pos: number) => {
            console.log("Hide")

            Tween.createOrReplace(entity, {
                mode: Tween.Mode.Move({
                    start: Transform.get(entity).position,
                    end: { ...Transform.get(entity).position, y: pos }
                }),
                duration: animationConfig.frogSkipGoBackTime,
                easingFunction: EasingFunction.EF_EASEOUTBACK,
            })

            utils.timers.setTimeout(() => {
                pointerEventsSystem.removeOnPointerDown(entity)
                GltfContainer.createOrReplace(entity, { src: frog01.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
            }, animationConfig.frogSkipGoBackTime)

            this.toadsAmount--
            console.log(this.toadsAmount)
            if (this.toadsAmount == 0) this.stopGame()
        }
        console.log(toadsGameState.listOfEntity.get('ground'))
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

        for (let i = 1; i <= this.toadsAmount; i++) {
            this.initialTimeGap = this.initialTimeGap + 1500
            let random = Math.floor(Math.random() * toadsGameConfig.ToadsAmount) + 1
            let isEnemy = Math.floor(Math.random() * 10) >= 3 ? true : false
            const entity = this.availableEntity.get(random)
            let y = Transform.get(entity).position.y;
            Tween.deleteFrom(entity)
            this.toadsTimer.set(i, {
                start: utils.timers.setTimeout(async () => {
                    toadsAppeared++
                    if (!isEnemy) GltfContainer.createOrReplace(entity, { src: frog02.src, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5 })
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
                            opts: { button: InputAction.IA_POINTER, hoverText: 'SMASH', maxDistance: 6},
                        },
                        () => {
                            console.log('CLICKED')
                            utils.timers.clearTimeout(this.toadsTimer.get(i).finish);
                            this.hitHammer({ target: entity, pos: y })
                            isEnemy ? this.correctSmashCounter++ : this.mistakeSmashCounter++
                        }
                    )
                    this.toadsTimer.get(i).finish = utils.timers.setTimeout(() => hideEntity(entity, y), animationConfig.frogStayTime)
                }, this.initialTimeGap)
            })
        }
    }

    public stopGame() {
        console.log("Game is stopped")
        pointerEventsSystem.removeOnPointerDown(toadsGameState.listOfEntity.get('board'))
        this.stopHammer()
        pointerEventsSystem.removeOnPointerDown(toadsGameState.listOfEntity.get('ground'))
        this.toadsTimer.forEach((e, k) => {
            utils.timers.clearTimeout(e.start)
            this.resolveReady()
        })

    }
}