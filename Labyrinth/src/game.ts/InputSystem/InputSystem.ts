import { engine, InputAction, inputSystem, PointerEventType } from '@dcl/sdk/ecs'
import { Board } from '../../BoardEngine/Board'
import { Direction } from '../../BoardEngine/Types'

export class InputSystem {
  private _entityId: number | undefined
  private _board: Board

  constructor(board: Board) {
    this._board = board
    engine.addSystem(this.update.bind(this))
  }

  public updatePlayerEntity(entityId: number | undefined): void {
    this._entityId = entityId
  }

  public update(): void {
    if (!this._entityId) return
    if (inputSystem.isTriggered(InputAction.IA_FORWARD, PointerEventType.PET_DOWN)) {
        this._board.moveEntityDirection(this._entityId, Direction.TOP)
      }
      if (inputSystem.isTriggered(InputAction.IA_BACKWARD, PointerEventType.PET_DOWN)) {
        this._board.moveEntityDirection(this._entityId, Direction.BOTTOM)

      }
      if (inputSystem.isTriggered(InputAction.IA_LEFT, PointerEventType.PET_DOWN)) {
        this._board.moveEntityDirection(this._entityId, Direction.LEFT)
      }
      if (inputSystem.isTriggered(InputAction.IA_RIGHT, PointerEventType.PET_DOWN)) {
        this._board.moveEntityDirection(this._entityId, Direction.RIGHT)
      }
  }
}
