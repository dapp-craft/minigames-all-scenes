import { Cell } from "./Cell";
import { Entity } from "./Entity";
import { CellType, Direction, Position } from "./Types";


// Board class managing the game board
export class Board {
    private _cells: Cell[][];
    private _width: number;
    private _height: number;

    private _entityCount: number = 1;
    private _entities: Map<number, Entity> = new Map();


    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._cells = [];
        this.initializeBoard();
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public get entities(): Entity[] {
        return Array.from(this._entities.values());
    }

    public addEntity(entity: Entity): number {
        this._entities.set(this._entityCount, entity);
        return this._entityCount++;
    }

    public removeEntity(id: number): void {
        this.checkEntityExists(id);
        this._entities.delete(id);
    }

    public getEntity(id: number): Entity | undefined {
        this.checkEntityExists(id);
        return this._entities.get(id);
    }

    public moveEntity(id: number, position: Position): void {
        this.checkEntityExists(id);
        this.checkCellExists(position.x, position.y);
        this.getEntitySafe(id).position = position;
    }

    public moveEntityDirection(id: number, direction: Direction): void {
        this.checkEntityExists(id);
        const entity = this.getEntitySafe(id);
        const newPosition = entity.getMovePosition(direction);
        this.checkCellExists(newPosition.x, newPosition.y);
        this.moveEntity(id, newPosition);
    }


    public setCellType(x: number, y: number, type: CellType): void {
        this._cells[y][x].type = type;
    }

    public getSellType(x: number, y: number): CellType {
        // Check if the cell exists
        if (x >= 0 && x < this._width && y >= 0 && y < this._height) {
            return this._cells[y][x].type;
        }
        throw new Error(`Cell not found: ${x}, ${y}`);
    }

    public getCell(x: number, y: number): Cell {
        this.checkCellExists(x, y);
        return this._cells[y][x];
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
                    result += this._cells[y][x].isConnectedTo(this._cells[y][x + 1]) ? '─' : ' ';
                }
            }
            result += '\n';

            // Second line: vertical connections (if not first row)
            if (y > 0) {  // Changed condition from y < height-1 to y > 0
                for (let x = 0; x < this._width; x++) {
                    // Add vertical connection if it exists (connecting to row below)
                    result += this._cells[y][x].isConnectedTo(this._cells[y - 1][x]) ? '│' : ' ';  // Changed y+1 to y-1
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

        const startCell = this.getCell(start.x, start.y);
        const endCell = this.getCell(end.x, end.y);

        if (!startCell || !endCell) {
            throw new Error('Start or end cell not found');
        }

        // BFS to find the path
        const queue: Cell[] = [];
        const visited: Set<Cell> = new Set();
        const parent: Map<string, Cell | undefined> = new Map();

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

            for (const neighbor of current.getAllNeighbors().filter(neighbor => neighbor.isConnectedTo(current))) {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                    parent.set(neighbor.toString(), current);
                }
            }
        }

        if (!parent.has(endCell.toString())) {
            return path;
        }

        let current: Cell | undefined = endCell;
        while (current) {
            path.push(current.position);
            current = parent.get(current.toString());
        }

        return path.reverse();
    }


    private initializeBoard(): void {
        // Create cells
        for (let y = 0; y < this._height; y++) {
            this._cells[y] = [];
            for (let x = 0; x < this._width; x++) {
                this._cells[y][x] = new Cell(x, y);
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
    
    private getEntitySafe(id: number): Entity {
        const entity = this._entities.get(id);
        if (!entity) {
            throw new Error(`Entity not found: ${id}`);
        }
        return entity;
    }
}

