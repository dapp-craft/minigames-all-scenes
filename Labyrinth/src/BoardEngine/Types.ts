// Cell types enum to distinguish different cell types
export type CellType = number;

// Entity type to distinguish different entities
export type EntityType = number;

// Direction enum to help with neighbor references
export enum Direction {
    TOP,
    RIGHT,
    BOTTOM,
    LEFT
}

// Direction position delta
export const DirectionPositionDelta: { [key in Direction]: Position } = {
    [Direction.TOP]: {x: 0, y: 1},
    [Direction.RIGHT]: {x: 1, y: 0},
    [Direction.BOTTOM]: {x: 0, y: -1},
    [Direction.LEFT]: {x: -1, y: 0}
}

// Position type to represent a cell's coordinates
export type Position = {
    x: number;
    y: number;
}