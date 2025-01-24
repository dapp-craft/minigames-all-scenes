import { Cell, CellData } from "./Cell";
import { Entity } from "./Entity";
import { BoardEventPayload, BoardEventType, EventBus } from "./Events";
import { CellType, Direction, EntityType, Position } from "./Types";


// Board class managing the game board
export class Board<
    TCellType extends string = string,
    TEntityType extends string = string
> {
    private _cells: Cell<TCellType>[][];
    private _width: number;
    private _height: number;

    private _entities: Map<number, Entity<TCellType, EntityType>> = new Map();

    private _eventBus: EventBus = new EventBus();


    constructor(width: number, height: number, defaultCellType: TCellType) {
        this._width = width;
        this._height = height;
        this._cells = [];
        this.initializeBoard(defaultCellType);
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public get entities(): Entity<TCellType, EntityType>[] {
        return Array.from(this._entities.values());
    }

    public subscribe<T extends BoardEventType>(
        eventType: T,
        callback: (payload: BoardEventPayload<T>) => void
    ): void {
        this._eventBus.subscribe(eventType, callback);
    }

    public addEntity(position: Position, type: TEntityType, board: Board, allowedCellTypes?: TCellType[]): number {
        const entity = new Entity<TCellType, TEntityType>(position, type, board);
        if (allowedCellTypes) {
            entity.allowedCellTypes = allowedCellTypes
        } else {
            entity.allowedCellTypes = [this.getCellType(position.x, position.y) as TCellType]
        }
        this._entities.set(entity.id, entity);
        this._eventBus.emit("ENTITY_ADDED", { entity: entity.data });
        return entity.id;
    }

    public setAllowedCellTypes(id: number, cellTypes: TCellType[]): void {
        this.getEntitySafe(id).allowedCellTypes = cellTypes
    }

    public getAllowedCellTypes(id: number): TCellType[] {
        return this.getEntitySafe(id).allowedCellTypes
    }

    public removeEntity(id: number): void {
        this.checkEntityExists(id);
        this._eventBus.emit("ENTITY_REMOVED", { entity: this.getEntitySafe(id).data });
        this._entities.delete(id);
    }

    public moveEntity(id: number, position: Position): void {
        this.checkEntityExists(id);
        this.checkCellExists(position.x, position.y);
        this.getEntitySafe(id).position = position;
        this._eventBus.emit("ENTITY_MOVED", { entity: this.getEntitySafe(id).data });
    }

    public moveEntityDirection(id: number, direction: Direction): void {
        this.checkEntityExists(id);
        const entity = this.getEntitySafe(id);
        const newPosition = entity.getMovePosition(direction);
        this.checkCellExists(newPosition.x, newPosition.y);
        // Check if Entity can move to the new position type
        const cellType = this.getCellType(newPosition.x, newPosition.y) as TCellType;
        if (!entity.allowedCellTypes.includes(cellType)) {
            throw new Error(`Entity cannot move to the new position: ${newPosition.x}, ${newPosition.y} because Type ${cellType} is not allowed`);
        }
        this.moveEntity(id, newPosition);
    }

    public setCellType(x: number, y: number, type: TCellType): void {
        const cell = this.getCellSafe(x, y);
        cell.type = type;
        this._eventBus.emit("CELL_CHANGED", { cell: cell.data });
    }

    public getCell(x: number, y: number): CellData {
        return this.getCellSafe(x, y).data
    }

    public _getCellInstance(x: number, y: number): Cell<TCellType> {
        return this.getCellSafe(x, y)
    }

    public getCellType(x: number, y: number): CellType {
        return this.getCellSafe(x, y).type
    }

    public toString(): string {
        let result = '';

        // Iterate through rows from top to bottom (reversed)
        for (let y = this._height - 1; y >= 0; y--) {
            // First line: cells and horizontal connections
            for (let x = 0; x < this._width; x++) {
                result += this._cells[y][x].type; // Cell representation
                // Add horizontal connection if it exists and not at the last column
                if (x < this._width - 1) {
                    result += this._cells[y][x].isNeighbor(this._cells[y][x + 1]) ? '─' : ' ';
                }
            }
            result += '\n';

            // Second line: vertical connections (if not first row)
            if (y > 0) {  // Changed condition from y < height-1 to y > 0
                for (let x = 0; x < this._width; x++) {
                    // Add vertical connection if it exists (connecting to row below)
                    result += this._cells[y][x].isNeighbor(this._cells[y - 1][x]) ? '│' : ' ';  // Changed y+1 to y-1
                    // Add spacing for alignment
                    if (x < this._width - 1) {
                        result += ' ';
                    }
                }
                result += '\n';
            }
        }

        return result;
    }

    public getPath(start: Position, end: Position): Position[] {
        const path: Position[] = [];

        const startCell = this.getCellSafe(start.x, start.y);
        const endCell = this.getCellSafe(end.x, end.y);

        if (!startCell || !endCell) {
            throw new Error('Start or end cell not found');
        }

        // BFS to find the path
        const queue: Cell<TCellType>[] = [];
        const visited: Set<Cell<TCellType>> = new Set();
        const parent: Map<string, Cell<TCellType> | undefined> = new Map();

        queue.push(startCell);
        parent.set(startCell.toString(), undefined);

        while (queue.length > 0) {
            const current = queue.shift();

            if (current === endCell) {
                break;
            }

            if (!current) {
                throw new Error('Current cell not found');
            }

            visited.add(current);

            for (const neighbor of current.getAllNeighbors().filter(neighbor => neighbor.isNeighbor(current))) {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                    parent.set(neighbor.toString(), current);
                }
            }
        }

        if (!parent.has(endCell.toString())) {
            return path;
        }

        let current: Cell<TCellType> | undefined = endCell;
        while (current) {
            path.push(current.position);
            current = parent.get(current.toString());
        }

        return path.reverse();
    }


    private initializeBoard<T extends TCellType>(defaultCellType: T): void {
        // Create cells
        for (let y = 0; y < this._height; y++) {
            this._cells[y] = [];
            for (let x = 0; x < this._width; x++) {
                this._cells[y][x] = new Cell(x, y, defaultCellType);
            }
        }

        // Connect neighbors
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                if (x > 0) {
                    Cell.connect(this._cells[y][x], this._cells[y][x - 1]);
                }
                if (y > 0) {
                    Cell.connect(this._cells[y][x], this._cells[y - 1][x]);
                }
            }
        }
    }

    private checkEntityExists(id: number): void {
        if (!this._entities.has(id)) {
            throw new Error(`Entity not found: ${id}`);
        }
    }

    private checkCellExists(x: number, y: number): void {
        if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
            throw new Error(`Cell not found: ${x}, ${y}`);
        }
    }

    private getCellSafe(x: number, y: number): Cell<TCellType> {
        const cell = this._cells[y][x];
        if (!cell) {
            throw new Error(`Cell not found: ${x}, ${y}`);
        }
        return cell;
    }
    
    private getEntitySafe(id: number): Entity<TCellType, EntityType> {
        const entity = this._entities.get(id);
        if (!entity) {
            throw new Error(`Entity not found: ${id}`);
        }
        return entity;
    }
}

