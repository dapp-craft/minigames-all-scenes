import { engine, inputSystem, InputAction, PointerEventType } from '@dcl/sdk/ecs'
import { Direction } from '../objects/type'
import { GameController } from './gameController'

export class InputController {
  public gameController: GameController | undefined

  constructor() {
    engine.addSystem(this.update)
  }

  private update = () => {
    if (!this.gameController) return
    if (inputSystem.isTriggered(InputAction.IA_FORWARD, PointerEventType.PET_DOWN)) {
      this.gameController.setSnakeDirection(Direction.UP)
    }
    if (inputSystem.isTriggered(InputAction.IA_BACKWARD, PointerEventType.PET_DOWN)) {
      this.gameController.setSnakeDirection(Direction.DOWN)
    }
    if (inputSystem.isTriggered(InputAction.IA_LEFT, PointerEventType.PET_DOWN)) {
      this.gameController.setSnakeDirection(Direction.LEFT)
    }
    if (inputSystem.isTriggered(InputAction.IA_RIGHT, PointerEventType.PET_DOWN)) {
      this.gameController.setSnakeDirection(Direction.RIGHT)
    }

    if (inputSystem.isTriggered(InputAction.IA_JUMP, PointerEventType.PET_DOWN)) {
      if (!this.gameController.inGame) return
      this.gameController.setBoost(true)
    }
    if (inputSystem.isTriggered(InputAction.IA_JUMP, PointerEventType.PET_UP)) {
      if (!this.gameController.inGame) return
      this.gameController.setBoost(false)
    }
  }
}
