import { engine, InputAction, inputSystem, PointerEventType } from '@dcl/sdk/ecs'
import { Board } from '../BoardEngine/Board'
import { Direction } from '../BoardEngine/Types'
import { BOARD_RENDER } from '..'

export class InputSystem {
  private _entityId: number
  private _board: Board

  constructor(entityId: number, board: Board) {
    this._entityId = entityId
    this._board = board
    engine.addSystem(this.update.bind(this))
  }

  public update(): void {
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
