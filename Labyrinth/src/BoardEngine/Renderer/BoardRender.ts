import { engine, Entity, MeshRenderer, Transform, TransformType } from '@dcl/sdk/ecs'
import { EntityData } from '../Entity'
import { Board } from '../Board'
import { CellType, EntityType } from '../Types'
import { CellRenderer } from './CellRenderer'
import { CellData } from '../Cell'
import { EntityRenderer } from './EntityRenderer'
import { BoardEventPayload } from '../Events'

/**
 * Handles the rendering of the game board, including cells and entities
 */
export class BoardRender {
  private readonly _board: Board
  private readonly _boardEntity: Entity
  private readonly _cellRenderers: (CellRenderer | null)[][]
  private readonly _cellHandlers: Map<CellType, new (cell: CellData, board: Board) => CellRenderer>
  private readonly _entityRenderers: Map<number, EntityRenderer>
  private readonly _entityHandlers: Map<EntityType, new (entityData: EntityData, board: Board) => EntityRenderer>

  constructor(transform: TransformType, board: Board) {
    this._board = board
    this._boardEntity = this._initializeBoardEntity(transform)
    this._cellRenderers = this._initializeCellRenderers()
    this._cellHandlers = new Map()
    this._entityRenderers = new Map()
    this._entityHandlers = new Map()

    this._subscribeToEvents()
  }

  public get parentEntity(): Entity {
    return this._boardEntity
  }

  public get boardEntity(): Entity {
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

  // This method is used to rerender the whole board
  // Do not use it in the system, because it takes a lot of time
  public rerender(): void {
    this._cleanupCurrentRenderers()
    this._renderCells()
    this._renderEntities()
  }

  private _initializeBoardEntity(transform: TransformType): Entity {
    const entity = engine.addEntity()
    Transform.create(entity, transform)
    MeshRenderer.setPlane(entity)
    return entity
  }

  private _initializeCellRenderers(): (CellRenderer | null)[][] {
    const renderers: (CellRenderer | null)[][] = []
    for (let i = 0; i < this._board.width; i++) {
      renderers.push(new Array(this._board.height).fill(null))
    }
    return renderers
  }

  private _subscribeToEvents(): void {
    this._board.subscribe('CELL_CHANGED', this._cellUpdateHandler.bind(this))
    this._board.subscribe('ENTITY_ADDED', this._entityAddHandler.bind(this))
    this._board.subscribe('ENTITY_MOVED', this._entityMovedHandler.bind(this))
    this._board.subscribe('ENTITY_REMOVED', this._entityRemovedHandler.bind(this))
    this._board.subscribe('BOARD_RESIZED', this._boardResizedHandler.bind(this))
  }

  private _cleanupCurrentRenderers(): void {
    // Cleanup cells
    for (let i = 0; i < this._board.width; i++) {
      for (let j = 0; j < this._board.height; j++) {
        this._cleanupCellRenderer(i, j)
      }
    }

    // Cleanup entities
    for (const renderer of this._entityRenderers.values()) {
      renderer.terminate()
    }
    this._entityRenderers.clear()
  }

  private _renderCells(): void {
    for (let i = 0; i < this._board.width; i++) {
      for (let j = 0; j < this._board.height; j++) {
        const cell = this._board.getCell(i, j)
        this._updateCellRenderer(cell)
      }
    }
  }

  private _renderEntities(): void {
    for (const entity of this._board.entities) {
      this._updateEntityRenderer(entity)
    }
  }

  private _cleanupCellRenderer(x: number, y: number): void {
    if (this._cellRenderers[x][y] !== null) {
      this._cellRenderers[x][y]?.terminate()
      this._cellRenderers[x][y] = null
    }
  }

  private _entityAddHandler(payload: BoardEventPayload<'ENTITY_ADDED'>): void {
    this._updateEntityRenderer(payload.entity)
  }

  private _entityMovedHandler(payload: BoardEventPayload<'ENTITY_MOVED'>): void {
    const renderer = this._getEntityRenderer(payload.entity.id)
    renderer.update(payload.entity)
  }

  private _entityRemovedHandler(payload: BoardEventPayload<'ENTITY_REMOVED'>): void {
    const renderer = this._getEntityRenderer(payload.entity.id)
    renderer.terminate()
    this._entityRenderers.delete(payload.entity.id)
  }

  private _boardResizedHandler(payload: BoardEventPayload<'BOARD_RESIZED'>): void {
    this._cleanupCurrentRenderers()
    this.rerender()
  }

  private _cellUpdateHandler(payload: BoardEventPayload<'CELL_CHANGED'>): void {
    this._updateCellRenderer(payload.cell)
  }

  private _updateCellRenderer(cellData: CellData): void {
    const { x, y } = cellData.position
    this._cleanupCellRenderer(x, y)

    const HandlerClass = this._getCellHandlerClass(cellData.type)
    this._cellRenderers[x][y] = new HandlerClass(cellData, this._board)
    this._cellRenderers[x][y]?.render()
  }

  private _updateEntityRenderer(entityData: EntityData): void {
    if (this._entityRenderers.has(entityData.id)) {
      this._entityRenderers.get(entityData.id)?.terminate()
    } else {
      const HandlerClass = this._getEntityHandlerClass(entityData.type)
      this._entityRenderers.set(entityData.id, new HandlerClass(entityData, this._board))
      this._entityRenderers.get(entityData.id)?.update(entityData)
    }
  }

  private _getEntityRenderer(entityId: number): EntityRenderer {
    const renderer = this._entityRenderers.get(entityId)
    if (!renderer) {
      throw new Error(`No renderer found for entity ${entityId}`)
    }
    return renderer
  }

  private _getCellHandlerClass(type: CellType): new (cell: CellData, board: Board) => CellRenderer {
    const HandlerClass = this._cellHandlers.get(type)
    if (!HandlerClass) {
      throw new Error(`No handler found for cell type ${type}`)
    }
    return HandlerClass
  }

  private _getEntityHandlerClass(type: EntityType): new (entityData: EntityData, board: Board) => EntityRenderer {
    const HandlerClass = this._entityHandlers.get(type)
    if (!HandlerClass) {
      throw new Error(`No handler found for entity type ${type}`)
    }
    return HandlerClass
  }
}
