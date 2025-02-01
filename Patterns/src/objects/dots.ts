import { sceneParentEntity } from "@dcl-sdk/mini-games/src"
import { engine, Transform, pointerEventsSystem, InputAction, MapResult, Schemas, Entity, GltfContainer, MeshCollider, Material, MeshRenderer, Tween, EasingFunction } from "@dcl/sdk/ecs"
import { Vector3, Quaternion, Color4 } from "@dcl/sdk/math"
import { inputBuffer } from "../game/types"
import { LEVEL } from "@dcl-sdk/mini-games/src/ui";
import { LEVELS } from "../levels";

const createMatrix = (rows: number, cols: number, initialValue: number = 0) => {
    return Array.from({ length: rows }, () => Array(cols).fill(initialValue));
};

// HARD CODE
export const DOTS: Entity[][] = createMatrix(2, 2)
export const playerDotsClicks: Entity[] = []

export const Dot = engine.defineComponent('dot', {
    position: Schemas.Map({
        row: Schemas.Number,
        col: Schemas.Number
    }),
    isActive: Schemas.Boolean,
    isLocked: Schemas.Boolean,
})

export const DotsSpec = {
    dots: Schemas.Array(
        Schemas.Map({
            position: Schemas.Map({
                row: Schemas.Number,
                col: Schemas.Number
            }),
            isActive: Schemas.Boolean,
            isLocked: Schemas.Boolean,
        })
    )
}

export function createDot(id: number, row: number, column: number) {
    const dot = createDotEntity(id)
    DOTS[row][column] = dot
    console.log(DOTS[row][column], id)
    return dot
}

export function getDotsState() {
    let state: MapResult<typeof DotsSpec> = { dots: [] }
    for (let i = 0; i < DOTS.length; i++) {
        for (let j = 0; j < DOTS.length; j++) {
            state.dots.push(Dot.get(DOTS[i][j]))
        }
    }
    return state
}

export function createDotEntity(id: number) {
    const dot = engine.addEntity()
    Transform.create(dot, {
        position: Vector3.Zero(),
        scale: Vector3.Zero(),
        rotation: Quaternion.Identity(),
        parent: sceneParentEntity
    })
    Dot.create(dot, {
        position: { row: -1, col: -1 },
        isActive: false,
        isLocked: false,
    })
    return dot
}

export const activeOnclick = (dot: Entity) => {
    pointerEventsSystem.onPointerDown(
        {
            entity: dot,
            opts: {
                button: InputAction.IA_POINTER,
                hoverText: 'Select DOT'
            }
        },
        () => {
            console.log('Click on Dot')
            if (Dot.getMutable(dot).isLocked) return
            dotReaction(dot, 'active')
            Dot.getMutable(dot).isActive = !Dot.getMutable(dot).isActive
            let lastDot = updateInputBuffer(dot)
            playerDotsClicks.push(dot)
            checkPattern()

            if (lastDot == undefined) return
            dotReaction(lastDot, 'finished')
            dotReaction(dot, 'finished')
            Dot.getMutable(lastDot).isLocked = true
            Dot.getMutable(dot).isLocked = true
            pointerEventsSystem.removeOnPointerDown(lastDot)
            pointerEventsSystem.removeOnPointerDown(dot)

            createLine(dot, lastDot)
        }
    )
}

export const createLine = (startDot: Entity, endDot: Entity) => {
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

export const checkPattern = () => {
    let tempMatrix = createMatrix(2, 2)
    let interator = 0
    playerDotsClicks.forEach(e => {
        for (let i = 0; i < DOTS.length; i++) {
            for (let j = 0; j < DOTS[i].length; j++) {
                if (DOTS[i][j] === e) {
                    interator++
                    tempMatrix[i][j] = interator
                    console.log(i, j)
                }
            }
        }
    })
    if (JSON.stringify(LEVELS[1].dotMat) == JSON.stringify(tempMatrix)) {
        console.log("WIN!")
    } else if (playerDotsClicks.length >= DOTS.length * 2) {
        console.log("RESTART");
    }
}

export const dotReaction = (dot: Entity, action: 'active' | 'finished' | 'default') => {
    let color = Color4.White()
    if (action == 'active') color = Color4.Green()
    else if (action == 'finished') color = Color4.Yellow();
    Material.setPbrMaterial(dot, { albedoColor: color })
}

const updateInputBuffer = (entity: Entity) => {
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

export function updateDotsState(state: MapResult<typeof DotsSpec>) {
    // ERROR
    state.dots
        .forEach((dot: any, i: number) => {
            for (let j = 0; j < DOTS.length; j++) {
                Dot.getMutable(DOTS[i][j]).position = dot.position
                Dot.getMutable(DOTS[i][j]).isActive = dot.isActive
                Dot.getMutable(DOTS[i][j]).isLocked = dot.isLocked
            }
        })
}