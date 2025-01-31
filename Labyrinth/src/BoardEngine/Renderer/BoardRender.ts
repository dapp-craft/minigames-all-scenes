import { engine, Entity, Material, MeshRenderer, Transform, TransformType } from '@dcl/sdk/ecs'
import { EntityData, Entity as LabyrinthEntity } from '../Entity'
import { Board } from '../Board'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { CellType, EntityType, Position } from '../Types'
import { CellRenderer } from './CellRenderer'
import { Cell, CellData } from '../Cell'
import { Extras } from './Types'
import { EntityRenderer } from './EntityRenderer'
import { BoardEventPayload } from '../Events'

export class BoardRender {
  private _board: Board

  private _boardEntity: Entity

  private _cellRenderers: (CellRenderer | null)[][]
  private _cellHandlers: Map<CellType, new (cell: CellData, board: Board) => CellRenderer> = new Map()

  private _entityRenderers: Map<number, EntityRenderer> = new Map()
  private _entityHandlers: Map<EntityType, new (entityData: EntityData, board: Board) => EntityRenderer> = new Map()

  constructor(transform: TransformType, board: Board) {
    this._board = board

    this._boardEntity = engine.addEntity()
    Transform.create(this._boardEntity, transform)
    MeshRenderer.setPlane(this._boardEntity)

    this._cellRenderers = []
    for (let i = 0; i < this._board.width; i++) {
      this._cellRenderers.push([])
      for (let j = 0; j < this._board.height; j++) {
        this._cellRenderers[i].push(null)
      }
    }
    this._board.subscribe('CELL_CHANGED', this._cellUpdateHandler.bind(this))
    this._board.subscribe('ENTITY_ADDED', this._entityAddHandler.bind(this))
    this._board.subscribe('ENTITY_MOVED', this._entityMovedHandler.bind(this))
    this._board.subscribe('ENTITY_REMOVED', this._entityRemovedHandler.bind(this))
    this._board.subscribe('BOARD_RESIZED', this._boardResizedHandler.bind(this))
  }

  public get parentEntity(): Entity {
    return this._boardEntity
  }

  public addEntityRenderer(
    type: EntityType,
    renderer: new (entityData: EntityData, board: Board) => EntityRenderer
  ): void {
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

  private _entityAddHandler(payload: BoardEventPayload<'ENTITY_ADDED'>): void {
    this._updateEntityRenderer(payload.entity)
  }

  private _entityMovedHandler(payload: BoardEventPayload<'ENTITY_MOVED'>): void {
    const renderer = this._entityRenderers.get(payload.entity.id)
    if (!renderer) {
      throw new Error(`No renderer for entity ${payload.entity.id}`)
    }
    renderer.update(payload.entity)
  }

  private _entityRemovedHandler(payload: BoardEventPayload<'ENTITY_REMOVED'>): void {
    const renderer = this._entityRenderers.get(payload.entity.id)
    if (!renderer) {
      throw new Error(`No renderer for entity ${payload.entity.id}`)
    }
    renderer.terminate()
    this._entityRenderers.delete(payload.entity.id)
  }

  private _boardResizedHandler(payload: BoardEventPayload<'BOARD_RESIZED'>): void {
    for (const row of this._cellRenderers) {
      for (const cell of row) {
        if (cell !== null) {
          cell.terminate()
        }
      }
    }
    this.rerender()
  }

  public _cellUpdateHandler(payload: BoardEventPayload<'CELL_CHANGED'>): void {
    this._updateCellRenderer(payload.cell)
  }

  private _updateCellRenderer(cellData: CellData): void {
    // Remove the old renderer
    if (this._cellRenderers[cellData.position.x][cellData.position.y] !== null) {
      this._cellRenderers[cellData.position.x][cellData.position.y]?.terminate()
      this._cellRenderers[cellData.position.x][cellData.position.y] = null
    }

    const HandlerClass = this._cellHandlers.get(cellData.type)
    if (!HandlerClass) {
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
