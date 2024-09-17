import { EasingFunction, Entity, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, TextShape, Transform, Tween, tweenSystem } from "@dcl/sdk/ecs"
import { tempLocators, toadsGameConfig } from "../config"
import { sceneParentEntity, toadsGameState } from "../state"
import * as utils from '@dcl-sdk/utils'

export class GameLogic {
    private availableEntity = new Map()
    private correctSmashCounter = 0
    private mistakeSmashCounter = 0
    private miss = 0
    private resolveReady!: () => void
    private gameIsDone: Promise<void>

    constructor() {
        this.gameIsDone = new Promise((res) => { this.resolveReady = res })
    }

    public async startGame() {
        this.correctSmashCounter = 0
        this.mistakeSmashCounter = 0
        this.miss = 0
        this.initializeEntity()
        this.playGame()
        await this.gameIsDone;
        this.gameIsDone = new Promise(r => this.resolveReady = r)
        console.log("Finish")
        return { correct: this.correctSmashCounter, mistake: this.mistakeSmashCounter, miss: this.miss }
    }

    private initializeEntity() {
        for (let i = 0; i < toadsGameConfig.ToadsAmount; i++) {
            this.availableEntity.set(i + 1, toadsGameState.availableEntity[i])
            Transform.createOrReplace(toadsGameState.availableEntity[i], { ...tempLocators.get(`Toad${i + 1}`), parent: sceneParentEntity })
            MeshRenderer.setBox(toadsGameState.availableEntity[i])
            MeshCollider.setBox(toadsGameState.availableEntity[i])
        }
    }

    private playGame() {
        const toadsAmount = 10
        
        let time = 900
        let toadsAppeared = 0

        const hideEntity = (entity: Entity, pos: number) => {
            pointerEventsSystem.removeOnPointerDown(entity)
            MeshRenderer.setBox(entity)
            Tween.createOrReplace(entity, {
                mode: Tween.Mode.Move({
                    start: Transform.get(entity).position,
                    end: { ...Transform.get(entity).position, y: pos }
                }),
                duration: 50,
                easingFunction: EasingFunction.EF_EASEOUTBACK,
            })
            if (toadsAppeared == toadsAmount) {
                pointerEventsSystem.removeOnPointerDown(toadsGameState.listOfEntity.get('board'))
                this.resolveReady()
            }
        }

        pointerEventsSystem.onPointerDown(
            {
                entity: toadsGameState.listOfEntity.get('board'),
                opts: { button: InputAction.IA_POINTER, hoverText: 'SMASH' },
            },
            () => this.miss++
        )

        for (let i = 0; i <= toadsAmount; i++) {
            time = time + 1000 + Math.random() * 1000
            let random = Math.floor(Math.random() * toadsGameConfig.ToadsAmount) + 1
            let isEnemy = Math.floor(Math.random() * 10) >= 3 ? true : false
            const entity = this.availableEntity.get(random)
            let y = Transform.get(entity).position.y
            Tween.deleteFrom(entity)
            utils.timers.setTimeout(async () => {
                toadsAppeared++
                if (!isEnemy) MeshRenderer.setSphere(entity)
                Tween.createOrReplace(entity, {
                    mode: Tween.Mode.Move({
                        start: Transform.get(entity).position,
                        end: { ...Transform.get(entity).position, y: y + 1 },
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
                        isEnemy ? this.correctSmashCounter++ : this.mistakeSmashCounter++
                    }
                )
                utils.timers.setTimeout(() => hideEntity(entity, y), 900)
            }, time)
        }
    }
}