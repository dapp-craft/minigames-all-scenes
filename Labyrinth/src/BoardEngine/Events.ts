import { CellData } from "./Cell";
import { EntityData } from "./Entity";


export type BoardEventMap = {
  'ENTITY_ADDED': { entity: EntityData };
  'ENTITY_REMOVED': { entity: EntityData };
  'ENTITY_MOVED': { entity: EntityData };
  'CELL_CHANGED': { cell: CellData };
  'BOARD_RESIZED': { width: number, height: number };
}

export type BoardEventType = keyof BoardEventMap
export type BoardEventPayload<T extends BoardEventType> = BoardEventMap[T]

export class EventBus {
  private _listeners: Map<BoardEventType, Set<(payload: any) => void>> = new Map()

  public subscribe<T extends BoardEventType>(
    eventType: T,
    callback: (payload: BoardEventPayload<T>) => void
  ): () => void {
    if (!this._listeners.has(eventType)) {
      this._listeners.set(eventType, new Set())
    }
    this._listeners.get(eventType)?.add(callback)

    // Return unsubscribe function
    return () => {
      this._listeners.get(eventType)?.delete(callback)
    }
  }

  public emit<T extends BoardEventType>(
    eventType: T,
    payload: BoardEventPayload<T>
  ): void {
    this._listeners.get(eventType)?.forEach(callback => callback(payload))
  }
} 