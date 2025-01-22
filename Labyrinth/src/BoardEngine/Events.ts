import { CellData } from "./Cell";
import { EntityData } from "./Entity";
import { Position } from "./Types";

export enum EventType {
    ENTITY_ADDED = 'ENTITY_ADDED',
    ENTITY_REMOVED = 'ENTITY_REMOVED',
    ENTITY_MOVED = 'ENTITY_MOVED',
    CELL_CHANGED = 'CELL_CHANGED'
}

export type BoardEvent = {
  type: EventType;
  payload: {
    entity?: EntityData;
    cell?: CellData;
  };
}

export class EventBus {
  private _listeners: Map<string, ((event: BoardEvent) => void)[]> = new Map();

  public subscribe(eventType: BoardEvent['type'], callback: (event: BoardEvent) => void): void {
    if (!this._listeners.has(eventType)) {
      this._listeners.set(eventType, []);
    }
    this._listeners.get(eventType)?.push(callback);
  }

  public emit(event: BoardEvent): void {
    this._listeners.get(event.type)?.forEach(callback => callback(event));
  }
} 