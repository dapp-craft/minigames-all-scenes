import { Direction, Position, DirectionPositionDelta } from "./Types";

export abstract class Entity {
    private _position: Position;

    constructor(position: Position) {
        this._position = position;
    }

    public get position(): Position {
        return {x: this._position.x, y: this._position.y};
    }

    public set position(position: Position) {
        this._position = position;
    }

    public getMovePosition(direction: Direction): Position {
        return {x: this._position.x + DirectionPositionDelta[direction].x, y: this._position.y + DirectionPositionDelta[direction].y};
    }

    public abstract render(): void;
}