import { CellData } from './Cell'
import { EntityData } from './Entity'

export type BoardEventMap = {
  ENTITY_ADDED: { entity: EntityData }
  ENTITY_REMOVED: { entity: EntityData }
  ENTITY_MOVED: { entity: EntityData }
  CELL_CHANGED: { cell: CellData }
  BOARD_RESIZED: { width: number; height: number }
}

export type BoardEventType = keyof BoardEventMap
export type BoardEventPayload<T extends BoardEventType> = BoardEventMap[T]

type Subscriber = {
  id: string
  callback: (payload: any) => void
}

export class EventBus {
  private _listeners: Map<BoardEventType, Map<string, Subscriber>> = new Map()
  private _nextId: number = 1

  private generateId(): string {
    return `sub_${this._nextId++}`
  }

  public subscribe<T extends BoardEventType>(eventType: T, callback: (payload: BoardEventPayload<T>) => void): string {
    if (!this._listeners.has(eventType)) {
      this._listeners.set(eventType, new Map())
    }
    const id = this.generateId()
    this._listeners.get(eventType)?.set(id, { id, callback })
    return id
  }

  public unsubscribe(eventType: BoardEventType, subscriberId: string): void {
    this._listeners.get(eventType)?.delete(subscriberId)
  }

  public unsubscribeAll(eventType?: BoardEventType): void {
    if (eventType) {
      this._listeners.get(eventType)?.clear()
    } else {
      this._listeners.clear()
    }
  }

  public emit<T extends BoardEventType>(eventType: T, payload: BoardEventPayload<T>): void {
    this._listeners.get(eventType)?.forEach((subscriber) => subscriber.callback(payload))
  }
}
