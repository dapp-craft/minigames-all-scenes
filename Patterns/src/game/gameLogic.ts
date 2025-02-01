import {
    EasingFunction,
    engine,
    Entity,
    InputAction,
    MapResult,
    Material,
    MeshCollider,
    MeshRenderer,
    pointerEventsSystem,
    Schemas,
    Transform,
    Tween
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { DotsSpec } from '../objects/dots'
import { gameLogic } from '..'
import { CreateStateSynchronizer } from '../../../common/synchronizer'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { inputBuffer } from './types'
import { LEVELS } from '../levels'
import { tempLocators } from '../config'

const SyncState_ = CreateStateSynchronizer('dotsState', DotsSpec, {
    update: async (state: any) => {
        console.log('New state received', state)
        gameLogic.applyState(state)
    }
})
export let SyncState: InstanceType<typeof SyncState_>

export class Game {
    private DOTS: Entity[][] = this.createMatrix(2, 2)
    private playerDotsClicks: Entity[] = []
    private Dot = engine.defineComponent('dot', {
        position: Schemas.Map({
            row: Schemas.Number,
            col: Schemas.Number
        }),
        isActive: Schemas.Boolean,
        isLocked: Schemas.Boolean,
        connectedTo: Schemas.Map({
            row: Schemas.Number,
            col: Schemas.Number
        }),
    })
    private level: number = 1

    constructor(level: number) {
        this.level = level
        this.init()

        SyncState = new SyncState_()
        SyncState.start()
    }

    init() {
        let index = 0
        for (let i = 0; i < LEVELS[this.level].dotMat.length; i++) {
            for (let j = 0; j < LEVELS[this.level].dotMat.length; j++) {
                index++
                const dot = engine.addEntity()
                this.DOTS[i][j] = dot
                MeshRenderer.setBox(dot)
                MeshCollider.setBox(dot)
                Transform.createOrReplace(dot, tempLocators.get(`test${index}`))
                // Transform.create(dot, {
                //     position: Vector3.Zero(),
                //     scale: Vector3.Zero(),
                //     rotation: Quaternion.Identity(),
                //     parent: sceneParentEntity
                // })
                this.Dot.create(dot, {
                    position: { row: i, col: j },
                    isActive: false,
                    isLocked: false,
                })

                pointerEventsSystem.onPointerDown(
                    {
                        entity: dot,
                        opts: {
                            button: InputAction.IA_POINTER,
                            hoverText: 'Click me'
                        }
                    },
                    () => {
                        console.log('Click on Dot')
                        console.log(this.Dot.get(dot))
                        if (this.Dot.getMutable(dot).isLocked) return
                        this.dotReaction(dot, 'active')
                        this.Dot.getMutable(dot).isActive = !this.Dot.getMutable(dot).isActive
                        let lastDot = this.updateInputBuffer(dot)
                        this.playerDotsClicks.push(dot)
                        this.checkPattern()

                        if (lastDot == undefined) return
                        this.dotReaction(lastDot, 'finished')
                        this.dotReaction(dot, 'finished')
                        this.Dot.getMutable(lastDot).isLocked = true
                        this.Dot.getMutable(dot).isLocked = true
                        pointerEventsSystem.removeOnPointerDown(lastDot)
                        pointerEventsSystem.removeOnPointerDown(dot)
                        SyncState.send(this.getState())

                        this.createLine(dot, lastDot)
                    }
                )
            }
        }
    }

    private createMatrix(rows: number, cols: number, initialValue: number = 0) {return Array.from({ length: rows }, () => Array(cols).fill(initialValue))};

    private checkPattern() {
        let tempMatrix = this.createMatrix(2, 2)    
        let interator = 0
        this.playerDotsClicks.forEach(e => {
            for (let i = 0; i < this.DOTS.length; i++) {
                for (let j = 0; j < this.DOTS[i].length; j++) {
                    if (this.DOTS[i][j] === e) {
                        interator++
                        tempMatrix[i][j] = interator
                        console.log(i, j)
                    }
                }
            }
        })
        if (JSON.stringify(LEVELS[1].dotMat) == JSON.stringify(tempMatrix)) {
            console.log("WIN!")
        } else if (this.playerDotsClicks.length >= this.DOTS.length * 2) {
            console.log("RESTART");
        }
    }

    private createLine = (startDot: Entity, endDot: Entity) => {
        const line = engine.addEntity()
        MeshCollider.setBox(line)
        MeshRenderer.setBox(line)
        console.log(Transform.get(startDot).position, Transform.get(endDot).position)
        Transform.create(line, {
            position: Vector3.center(Transform.get(startDot).position, Transform.get(endDot).position),
            rotation: Quaternion.fromLookAt(Transform.get(startDot).position, Transform.get(endDot).position),
        })
        console.log(Transform.get(line).rotation)
        Tween.create(line, {
            mode: Tween.Mode.Scale({
                start: Vector3.Zero(),
                end: Vector3.create(0.3, 0.3, Vector3.distance(Transform.get(startDot).position, Transform.get(endDot).position))
            }),
            duration: 200,
            easingFunction: EasingFunction.EF_LINEAR,
        })
    }

    private dotReaction(dot: Entity, action: 'active' | 'finished' | 'default') {
        let color = Color4.White()
        console.log("REATION")
        if (action == 'active') color = Color4.Green()
        else if (action == 'finished') color = Color4.Yellow();
        Material.setPbrMaterial(dot, { albedoColor: color })
    }

    private updateInputBuffer(entity: Entity) {
        inputBuffer.selectedDot = entity
        let tempDot
        if (inputBuffer.lastDot != inputBuffer.selectedDot || inputBuffer.lastDot != undefined) {
            inputBuffer.dotsConnection.push(inputBuffer.selectedDot)
            tempDot = inputBuffer.lastDot
        }
        else tempDot = undefined
        inputBuffer.lastDot = inputBuffer.selectedDot
        return tempDot
    }

    public getState(): MapResult<typeof DotsSpec> {
        let state: MapResult<typeof DotsSpec> = { dots: [] }
        for (let i = 0; i < this.DOTS.length; i++) {
            for (let j = 0; j < this.DOTS.length; j++) {
                state.dots.push(this.Dot.get(this.DOTS[i][j]))
            }
        }
        return state
    }

    public applyState(state: MapResult<typeof DotsSpec>) {
        console.log('New state applied', state)
        console.log(this.DOTS)
        for (const dot of state.dots) {
            let entity = this.DOTS[dot.position.row][dot.position.col]
            if (dot.isActive) {
                this.dotReaction(entity, 'active');
            }
        }
        // for (const dots of state.dots) {
        //     const entity = this.entities[dots.dotIndex]
        //     this.dotReaction(entity, 'active')
        // }
    }
}
