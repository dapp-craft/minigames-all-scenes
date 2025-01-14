import { Entity, GltfContainer, Transform, TransformType, VisibilityComponent, engine } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { readGltfLocators } from '../../../../common/locators'
import { GameController } from '../controllers/gameController'
import { foodModel, snakeBodyModel } from '../../resources'
import { CellEnum, Position } from '../objects/type'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'

export class SyncRenderer {
  private _gameController: GameController
  private _entity: Entity

  private cells: Array<Cell | null>

  constructor(gameController: GameController) {
    this._entity = engine.addEntity()
    if (!Transform.has(this._entity))
      Transform.createOrReplace(this._entity, {
        position: Vector3.create(0, 0, 0),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0),
        scale: Vector3.create(1, 1, 1),
        parent: sceneParentEntity
      })
    this._gameController = gameController

    this.setPosition()
    this.cells = Array.from(
      { length: this._gameController.boardSize.width * this._gameController.boardSize.height },
      () => null
    )
  }

  public render(state: any) {
    if (this._gameController.inGame) return
    if (state.board === undefined) return
    if (state.board.length === 0) {
      this.clean()
      return
    }
    state = state.board

    for (let y = 0; y < state.length; y++) {
      for (let x = 0; x < state[y].length; x++) {
        const cellIndex = this.posToIndex({ x: x, y: y })

        if (state[y][x] === CellEnum.EMPTY) {
          // Remove cell if it exists
          if (this.cells[cellIndex]) {
            this.cells[cellIndex]?.terminate()
            this.cells[cellIndex] = null
          }
          continue
        }

        if (!this.cells[cellIndex]) {
          const newCell = new Cell(this.cellTransform({ x: x, y: y }))
          newCell.state = state[y][x]
          this.cells[cellIndex] = newCell
        }

        if (this.cells[cellIndex]!.state !== state[y][x]) {
          this.cells[cellIndex]!.state = state[y][x]
        }
      }
    }
  }

  public clean() {
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i] != null) {
        this.cells[i]?.terminate()
        this.cells[i] = null
      }
    }
  }

  private cellTransform(pos: Position) {
    const boardSize = this._gameController.boardSize
    const boardTransform = Transform.get(this._entity)
    return {
      position: this._relativePosition(pos),
      scale: Vector3.create(1 / boardSize.width, 1 / boardSize.height, 1),
      rotation: boardTransform.rotation,
      parent: this._entity
    }
  }

  private _relativePosition(pos: Position) {
    const boardSize = this._gameController.boardSize

    // -0.5, -0.5 is the left bottom corner
    const x = -0.5 + pos.x * (1 / boardSize.width) + 1 / boardSize.width / 2
    const y = -0.5 + pos.y * (1 / boardSize.height) + 1 / boardSize.height / 2

    return { x: x, y: y, z: 0 }
  }

  private async setPosition() {
    const locators = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    const transform = locators.get('obj_screen')

    if (!transform) return

    // Center offset
    Transform.createOrReplace(this._entity, transform)
    Transform.getMutable(this._entity).parent = sceneParentEntity
  }

  private posToIndex(pos: Position) {
    return pos.x + pos.y * this._gameController.boardSize.width
  }
}

class Cell {
  public entity: Entity

  private _state: CellEnum = CellEnum.EMPTY

  public get state() {
    return this._state
  }

  constructor(transform: TransformType) {
    this.entity = engine.addEntity()
    if (!Transform.getOrNull(this.entity)) Transform.createOrReplace(this.entity, transform)
    if (!VisibilityComponent.getOrNull(this.entity)) VisibilityComponent.createOrReplace(this.entity, { visible: true })
  }

  public set state(newState: CellEnum) {
    this._state = newState
    switch (newState) {
      case CellEnum.EMPTY:
        VisibilityComponent.getMutable(this.entity).visible = false
        break
      case CellEnum.SNAKE:
        if (!VisibilityComponent.getOrNull(this.entity)) VisibilityComponent.getMutable(this.entity).visible = true
        GltfContainer.createOrReplace(this.entity, snakeBodyModel)
        break
      case CellEnum.FOOD:
        if (!VisibilityComponent.getOrNull(this.entity)) VisibilityComponent.getMutable(this.entity).visible = true
        GltfContainer.createOrReplace(this.entity, foodModel)
        break
    }
  }

  public terminate() {
    engine.removeEntity(this.entity)
  }
}
