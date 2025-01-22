import { engine, Entity, Material, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import { Entity as LabyrinthEntity } from '../Entity'
import { Board } from '../Board'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { CellType, EntityType, Position } from '../Types'
import { CellRenderer } from './CellRenderer'
import { Cell } from '../Cell'
import { Extras } from './Types'
import { EntityRenderer } from './EntityRenderer'

export class BoardRender {
  private _board: Board

  private _boardEntity: Entity

  private _cellRenderers: (CellRenderer | null)[][]
  private _cellHandlers: Map<CellType, new (cell: Cell, board: Board) => CellRenderer> = new Map()

  private _entityRenderers: Map<number, EntityRenderer> = new Map()
  private _entityHandlers: Map<EntityType, new (entity: LabyrinthEntity, board: Board) => EntityRenderer> = new Map()

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
        this._board.getCell(i, j).subscribe(this._updateCellRenderer.bind(this))
      }
    }
  }

  public get parentEntity(): Entity {
    return this._boardEntity
  }

  public addEntityRenderer(type: EntityType, renderer: new (entity: LabyrinthEntity, board: Board) => EntityRenderer): void {
    this._entityHandlers.set(type, renderer)
  }

  public addCellRenderer(type: CellType, renderer: new (cell: Cell, board: Board) => CellRenderer): void {
    this._cellHandlers.set(type, renderer)
  }

  public get boardEntity(): Entity {
    return this._boardEntity
  }

  public render(): void {
    for (let i = 0; i < this._board.width; i++) {
      for (let j = 0; j < this._board.height; j++) {
        const cell = this._board.getCell(i, j)
        const HandlerClass = this._cellHandlers.get(cell.type)
        if (!HandlerClass ) {
          throw new Error(`No handler for cell type ${cell.type}`)
        }
        if (this._cellRenderers[i][j] !== null) {
          this._updateCellRenderer(cell)
        } else {
          console.log("Creating new renderer for cell type", cell.type)
          this._cellRenderers[i][j] = new HandlerClass(cell, this._board)
          this._cellRenderers[i][j]?.render()
        }
      }
    }

    // Entity rendering
    const currentEntities = new Set(this._board.entities.map(e => e.id))
    
    // Remove renderers for entities that no longer exist
    for (const [id, renderer] of this._entityRenderers) {
      if (!currentEntities.has(id)) {
        renderer.terminate()
        this._entityRenderers.delete(id)
      }
    }
    
    // Create renderers for new entities
    for (const entity of this._board.entities) {
      // Check if the entity has a renderer
      if (!this._entityRenderers.has(entity.id)) {
        this._updateEntityRenderer(entity)
        this._entityRenderers.set(entity.id, this._entityRenderers.get(entity.id)!)
      }
    }

    // Render all renderers
    for (const renderer of this._entityRenderers.values()) {
      renderer.render()
    }
  }

  private _updateCellRenderer(cell: Cell): void {
    // Remove the old renderer
    if (this._cellRenderers[cell.position.x][cell.position.y] !== null) {
      this._cellRenderers[cell.position.x][cell.position.y]?.terminate()
      this._cellRenderers[cell.position.x][cell.position.y] = null
    }

    const HandlerClass = this._cellHandlers.get(cell.type)
    if (!HandlerClass ) {
      throw new Error(`No handler for cell type ${cell.type}`)
    }
    this._cellRenderers[cell.position.x][cell.position.y] = new HandlerClass(cell, this._board)
    this._cellRenderers[cell.position.x][cell.position.y]?.render()
  }

  private _updateEntityRenderer(entity: LabyrinthEntity): void {
    if (this._entityRenderers.has(entity.id)) {
      this._entityRenderers.get(entity.id)?.terminate()
    } else {
      const HandlerClass = this._entityHandlers.get(entity.type)
      if (!HandlerClass) {
        throw new Error(`No handler for entity type ${entity.type}`)
      }
      this._entityRenderers.set(entity.id, new HandlerClass(entity, this._board))
      this._entityRenderers.get(entity.id)?.render()
    }
  }
}
