import { EasingFunction, engine, Entity, GltfContainer, InputAction, MeshRenderer, pointerEventsSystem, RaycastQueryType, raycastSystem, Transform, Tween } from "@dcl/sdk/ecs"
import { toadsGameConfig } from "../config"
import { sceneParentEntity, toadsGameState } from "../state"
import * as utils from '@dcl-sdk/utils'
import { Vector3 } from "@dcl/sdk/math"
import { readGltfLocators } from "../../../common/locators"
import { frog01, frog02 } from "../resources/resources"

export class GameLogic {
    private availableEntity = new Map()
    private correctSmashCounter = 0
    private mistakeSmashCounter = 0
    private miss = 0
    private toadsAmount = 0
    private initialTimeGap = 900
    private additionTimeGap = 1000
    private resolveReady!: () => void
    private gameIsDone: Promise<void>
    private toadsTimer = new Map()

    constructor() {
        this.gameIsDone = new Promise((res) => { this.resolveReady = res })
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
        const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
        for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) {
            this.availableEntity.set(i + 1, toadsGameState.availableEntity[i])
            Transform.createOrReplace(toadsGameState.availableEntity[i], {position: data.get(`object_hole_${i + 1}`)?.position, parent: sceneParentEntity})
            console.log(data.get(`object_hole_${i + 1}`))
            GltfContainer.createOrReplace(toadsGameState.availableEntity[i], { src: frog01.src })
        }
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
        MeshRenderer.setCylinder(hammerEntity)
        Transform.createOrReplace(hammerEntity)
        raycastSystem.registerLocalDirectionRaycast(
            {
                entity: engine.CameraEntity,
                opts: {
                    queryType: RaycastQueryType.RQT_HIT_FIRST,
                    direction: Vector3.Forward(),
                    continuous: true
                },
            },
            function (hit) {
                if (hit.hits.length == 0) {
                    return
                }
                const hitPos = hit.hits[0].position
                if (hitPos == undefined) {
                    return
                }
                console.log("HERE")
                Transform.getMutable(hammerEntity).position = { ...hitPos, y: hitPos.y + 2 }
            }
        )
    }

    private stopHammer() {
        const hammerEntity = toadsGameState.listOfEntity.get('hammer')
        MeshRenderer.deleteFrom(hammerEntity)
        raycastSystem.removeRaycasterEntity(engine.CameraEntity)
    }

    private hitHammer() {
        const delay = 100
        const hammerEntity = toadsGameState.listOfEntity.get('hammer')

        raycastSystem.removeRaycasterEntity(engine.CameraEntity)

        // TODO refactor to Tween sequences

        Tween.createOrReplace(hammerEntity, {
            mode: Tween.Mode.Move({
                start: Transform.get(hammerEntity).position,
                end: { ...Transform.get(hammerEntity).position, y: Transform.get(hammerEntity).position.y - .5 }
            }),
            duration: delay,
            easingFunction: EasingFunction.EF_EASEOUTBACK,
        })
        utils.timers.setTimeout(async () => {
            Tween.deleteFrom(hammerEntity)
            utils.timers.setTimeout(async () => {
                Tween.createOrReplace(hammerEntity, {
                    mode: Tween.Mode.Move({
                        start: Transform.get(hammerEntity).position,
                        end: { ...Transform.get(hammerEntity).position, y: Transform.get(hammerEntity).position.y + .5 }
                    }),
                    duration: delay,
                    easingFunction: EasingFunction.EF_EASEOUTBACK,
                })
                this.activateHummer()
            }, 10)
        }, delay + 10)
    }

    private playGame() {
        let toadsAppeared = 0

        const hideEntity = (entity: Entity, pos: number) => {
            pointerEventsSystem.removeOnPointerDown(entity)
            // MeshRenderer.setBox(entity)
            GltfContainer.createOrReplace(entity, { src: frog01.src })

            Tween.createOrReplace(entity, {
                mode: Tween.Mode.Move({
                    start: Transform.get(entity).position,
                    end: { ...Transform.get(entity).position, y: pos }
                }),
                duration: 50,
                easingFunction: EasingFunction.EF_EASEOUTBACK,
            })
            this.toadsAmount--
            console.log(this.toadsAmount)
            if (this.toadsAmount == 0) this.stopGame()
        }

        pointerEventsSystem.onPointerDown(
            {
                entity: toadsGameState.listOfEntity.get('board'),
                opts: { button: InputAction.IA_POINTER, hoverText: 'SMASH' },
            },
            () => this.miss++
        )

        for (let i = 1; i <= this.toadsAmount; i++) {
            this.initialTimeGap = this.initialTimeGap + this.additionTimeGap + Math.random() * this.additionTimeGap
            let random = Math.floor(Math.random() * toadsGameConfig.ToadsAmount) + 1
            let isEnemy = Math.floor(Math.random() * 10) >= 3 ? true : false
            const entity = this.availableEntity.get(random)
            let y = Transform.get(entity).position.y;
            Tween.deleteFrom(entity)
            this.toadsTimer.set(i, {
                start: utils.timers.setTimeout(async () => {
                    toadsAppeared++
                    if (!isEnemy) GltfContainer.createOrReplace(entity, { src: frog02.src })
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
                            Tween.deleteFrom(entity)
                            console.log('CLICKED')
                            hideEntity(entity, y)
                            this.hitHammer()
                            isEnemy ? this.correctSmashCounter++ : this.mistakeSmashCounter++
                        }
                    )
                    this.toadsTimer.get(i).finish = utils.timers.setTimeout(() => hideEntity(entity, y), 900)
                }, this.initialTimeGap)
            })
        }
    }

    public stopGame() {
        pointerEventsSystem.removeOnPointerDown(toadsGameState.listOfEntity.get('board'))
        console.log("Game is stopped")
        this.stopHammer()
        this.toadsTimer.forEach((e, k) => {
            utils.timers.clearTimeout(e.start)
            this.resolveReady()
            // e.finish && utils.timers.clearTimeout(e.finish)
        })

    }
}