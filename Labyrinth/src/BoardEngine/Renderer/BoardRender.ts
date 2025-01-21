import { engine, Entity, Material, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import { Board } from '../Board'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { CellType, Position } from '../Types'
import { CellRenderer } from './CellRenderer'
import { Cell } from '../Cell'
import { Extras } from './Types'

export class BoardRender {
  private _board: Board

  private _boardEntity: Entity

  private _cells: Cell[][]
  private _cellRenderers: (CellRenderer | null)[][]

  private _handlers: Map<CellType, new (cell: Cell, board: Board) => CellRenderer> = new Map()

  constructor(board: Board) {
    this._board = board

    this._boardEntity = engine.addEntity()
    Transform.create(this._boardEntity, {position: {x: 8, y: 3, z: 8}, scale: {x: 5, y: 5, z: 5}})
    MeshRenderer.setPlane(this._boardEntity)

    this._cells = []
    this._cellRenderers = []
    for (let i = 0; i < this._board.width; i++) {
      this._cells.push([])
      this._cellRenderers.push([])
      for (let j = 0; j < this._board.height; j++) {
        this._cells[i].push(this._board.getCell(i, j))
        this._cellRenderers[i].push(null)
        this._cells[i][j].subscribe(this._updateCellRenderer.bind(this))
      }
    }
  }

  public addCellRenderer(type: CellType, renderer: new (cell: Cell, board: Board) => CellRenderer): void {
    this._handlers.set(type, renderer)
  }

  public get boardEntity(): Entity {
    return this._boardEntity
  }

  public render(): void {
    for (let i = 0; i < this._board.width; i++) {
      for (let j = 0; j < this._board.height; j++) {
        const cell = this._board.getCell(i, j)
        const HandlerClass = this._handlers.get(cell.type)
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
  }

  private _updateCellRenderer(cell: Cell): void {
    // Remove the old renderer
    if (this._cellRenderers[cell.position.x][cell.position.y] !== null) {
      this._cellRenderers[cell.position.x][cell.position.y]?.terminate()
      this._cellRenderers[cell.position.x][cell.position.y] = null
    }

    const HandlerClass = this._handlers.get(cell.type)
    if (!HandlerClass ) {
      throw new Error(`No handler for cell type ${cell.type}`)
    }
    this._cellRenderers[cell.position.x][cell.position.y] = new HandlerClass(cell, this._board)
    this._cellRenderers[cell.position.x][cell.position.y]?.render()
  }
}
