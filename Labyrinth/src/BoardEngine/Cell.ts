import { CellType, Direction, Position } from "./Types";

export class Cell {
    private _type: CellType;
    private _cells: Map<Direction, Cell | null>;
    private _position: Position;

    private _subscriberCount: number = 0;
    // Subscribers are functions that are called when the cell type changes
    private _subscribers: Map<number, (cell: Cell) => void> = new Map();
    
    constructor( x: number, y: number, type: CellType = 0) {
        this._type = type;
        this._position = { x, y };
        this._cells = new Map([
            [Direction.TOP, null],
            [Direction.RIGHT, null],
            [Direction.BOTTOM, null],
            [Direction.LEFT, null]
        ]);
    }

    public subscribe(subscriber: (cell: Cell) => void): number {
        this._subscribers.set(this._subscriberCount, subscriber);
        return this._subscriberCount++;
    }

    public unsubscribe(id: number): void {
        this._subscribers.delete(id);
    }

    public get type(): CellType {
        return this._type;
    }

    public set type(type: CellType) {
        this._type = type;
        this._subscribers.forEach((subscriber) => subscriber(this));
    }

    public getNeighbor(direction: Direction): Cell | null {
        return this._cells.get(direction) || null;
    }

    public getAllNeighbors(): Cell[] {
        return Array.from(this._cells.values()).filter((cell): cell is Cell => cell !== null);
    }

    public toString(): string {
        return `Cell: (${this._position.x}, ${this._position.y}) with type ${this._type}`;
    }

    public get position(): Position {
        return {x: this._position.x, y: this._position.y};
    }

    public static areAdjacent(cell1: Cell, cell2: Cell): boolean {
        const pos1 = cell1.position;
        const pos2 = cell2.position;
        
        const xDiff = Math.abs(pos1.x - pos2.x);
        const yDiff = Math.abs(pos1.y - pos2.y);
        
        return (xDiff === 1 && yDiff === 0) || (xDiff === 0 && yDiff === 1);
    }

    public static connect(cell1: Cell, cell2: Cell) {
        if (!Cell.areAdjacent(cell1, cell2)) {
            throw new Error(`Cells are not adjacent:\n   ${cell1.toString()} and\n   ${cell2.toString()}`);
        }

        const pos1 = cell1.position;
        const pos2 = cell2.position;

        // Determine the direction based on relative positions
        if (pos1.x === pos2.x) {
            if (pos1.y > pos2.y) {
                cell1.setNeighbor(Direction.TOP, cell2);
                cell2.setNeighbor(Direction.BOTTOM, cell1);
                return
            } else {
                cell1.setNeighbor(Direction.BOTTOM, cell2);
                cell2.setNeighbor(Direction.TOP, cell1);
                return
            }
        } else {
            if (pos1.x > pos2.x) {
                cell1.setNeighbor(Direction.LEFT, cell2);
                cell2.setNeighbor(Direction.RIGHT, cell1);
                return
            } else {
                cell1.setNeighbor(Direction.RIGHT, cell2);
                cell2.setNeighbor(Direction.LEFT, cell1);
                return 
            }
        }

        throw new Error(`Unexpected error when connecting cells:\n   ${cell1.toString()} and\n   ${cell2.toString()}`);
    }

    /**
     * Checks if this cell is connected to another cell and has the same type
     * @param otherCell The cell to check connection with
     * @returns True if the cells are connected and have the same type, false otherwise
     */
    public isConnectedTo(otherCell: Cell): boolean {
        return this.getAllNeighbors().includes(otherCell) && this._type === otherCell._type;
    }

    private setNeighbor(direction: Direction, cell: Cell | null): void {
        this._cells.set(direction, cell);
    }
}