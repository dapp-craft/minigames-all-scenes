import { engine, Entity, Material, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import { EntityData, Entity as LabyrinthEntity } from '../Entity'
import { Board } from '../Board'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { CellType, EntityType, Position } from '../Types'
import { CellRenderer } from './CellRenderer'
import { Cell, CellData } from '../Cell'
import { Extras } from './Types'
import { EntityRenderer } from './EntityRenderer'
import { BoardEvent, EventType } from '../Events'

export class BoardRender {
  private _board: Board

  private _boardEntity: Entity

  private _cellRenderers: (CellRenderer | null)[][]
  private _cellHandlers: Map<CellType, new (cell: CellData, board: Board) => CellRenderer> = new Map()

  private _entityRenderers: Map<number, EntityRenderer> = new Map()
  private _entityHandlers: Map<EntityType, new (entityData: EntityData, board: Board) => EntityRenderer> = new Map()

  constructor(board: Board) {
    this._board = board

    this._boardEntity = engine.addEntity()
    Transform.create(this._boardEntity, {position: {x: 8, y: 3, z: 8}, scale: {x: 5, y: 5, z: 5}})
    MeshRenderer.setPlane(this._boardEntity)

    this._cellRenderers = []
    for (let i = 0; i < this._board.width; i++) {
      this._cellRenderers.push([])
      for (let j = 0; j < this._board.height; j++) {
        this._cellRenderers[i].push(null)
      }
    }
    this._board.subscribe(EventType.CELL_CHANGED, this._cellUpdateHandler.bind(this))
    this._board.subscribe(EventType.ENTITY_ADDED, this._entityAddHandler.bind(this))
    this._board.subscribe(EventType.ENTITY_MOVED, this._entityMovedHandler.bind(this))
    this._board.subscribe(EventType.ENTITY_REMOVED, this._entityRemovedHandler.bind(this))
  }

  public get parentEntity(): Entity {
    return this._boardEntity
  }

  public addEntityRenderer(type: EntityType, renderer: new (entityData: EntityData, board: Board) => EntityRenderer): void {
    this._entityHandlers.set(type, renderer)
  }

  public addCellRenderer(type: CellType, renderer: new (cellData: CellData, board: Board) => CellRenderer): void {
    this._cellHandlers.set(type, renderer)
  }

  public get boardEntity(): Entity {
    return this._boardEntity
  }


  public rerender(): void {

    // Remove all Cell renderers
    for (let i = 0; i < this._board.width; i++) {
      for (let j = 0; j < this._board.height; j++) {
        if (this._cellRenderers[i][j] !== null) {
          this._cellRenderers[i][j]?.terminate()
          this._cellRenderers[i][j] = null
        }
      }
    }

    // Remove all Entity renderers
    for (const renderer of this._entityRenderers.values()) {
      renderer.terminate()
    }
    this._entityRenderers.clear()

    // Create new renderers
    for (let i = 0; i < this._board.width; i++) {
      for (let j = 0; j < this._board.height; j++) {
        const cell = this._board.getCell(i, j)
        this._updateCellRenderer(cell)
      }
    }

    // Entity rendering
    const entities = this._board.entities
    for (const entity of entities) {
      this._updateEntityRenderer(entity)
    }
  }

  private _entityAddHandler(event: BoardEvent): void {
    if (event.type === EventType.ENTITY_ADDED && event.payload.entity) {
      this._updateEntityRenderer(event.payload.entity)
    }
  }

  private _entityMovedHandler(event: BoardEvent): void {
    if (event.type === EventType.ENTITY_MOVED && event.payload.entity) {
      const renderer = this._entityRenderers.get(event.payload.entity.id)
      if (!renderer) {
        throw new Error(`No renderer for entity ${event.payload.entity.id}`)
      }
      renderer.update(event.payload.entity)
    }
  }

  private _entityRemovedHandler(event: BoardEvent): void {
    if (event.type === EventType.ENTITY_REMOVED && event.payload.entity) {
      const renderer = this._entityRenderers.get(event.payload.entity.id)
      if (!renderer) {
        throw new Error(`No renderer for entity ${event.payload.entity.id}`)
      }
      renderer.terminate()
      this._entityRenderers.delete(event.payload.entity.id)
    }
  }

  public _cellUpdateHandler(event: BoardEvent): void {
    if (event.type === EventType.CELL_CHANGED && event.payload.cell) {
      this._updateCellRenderer(event.payload.cell)
    }
  }

  private _updateCellRenderer(cellData: CellData): void {
    // Remove the old renderer
    if (this._cellRenderers[cellData.position.x][cellData.position.y] !== null) {
      this._cellRenderers[cellData.position.x][cellData.position.y]?.terminate()
      this._cellRenderers[cellData.position.x][cellData.position.y] = null
    }

    const HandlerClass = this._cellHandlers.get(cellData.type)
    if (!HandlerClass ) {
      throw new Error(`No handler for cell type ${cellData.type}`)
    }
    this._cellRenderers[cellData.position.x][cellData.position.y] = new HandlerClass(cellData, this._board)
    this._cellRenderers[cellData.position.x][cellData.position.y]?.render()
  }

  private _updateEntityRenderer(entityData: EntityData): void {
    if (this._entityRenderers.has(entityData.id)) {
      this._entityRenderers.get(entityData.id)?.terminate()
    } else {
      const HandlerClass = this._entityHandlers.get(entityData.type)
      if (!HandlerClass) {
        throw new Error(`No handler for entity type ${entityData.type}`)
      }
      this._entityRenderers.set(entityData.id, new HandlerClass(entityData, this._board))
      this._entityRenderers.get(entityData.id)?.update(entityData)
    }
  }
  
}
