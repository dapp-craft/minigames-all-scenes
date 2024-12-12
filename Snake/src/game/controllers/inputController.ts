import {
  engine,
  executeTask,
  GltfContainer,
  MeshRenderer,
  Transform,
  Entity,
  inputSystem,
  InputAction,
  PointerEventType,
  PointerLock
} from '@dcl/sdk/ecs'
import { SnakeHead } from '../objects/snakeHead'
import { Direction } from '../objects/type'
import { GameController } from './gameController'

export class InputController {
  public gameController: GameController | undefined

  constructor() {
    engine.addSystem(this.update)
  }

  private update = () => {
    if (!this.gameController) return
    if (
      inputSystem.isTriggered(InputAction.IA_FORWARD, PointerEventType.PET_DOWN)
    ) {
      this.gameController.setSnakeDirection(Direction.UP)
    }
    if (
      inputSystem.isTriggered(InputAction.IA_BACKWARD, PointerEventType.PET_DOWN)
    ) {
      this.gameController.setSnakeDirection(Direction.DOWN)
    }
    if (
      inputSystem.isTriggered(InputAction.IA_LEFT, PointerEventType.PET_DOWN)
    ) {
      this.gameController.setSnakeDirection(Direction.LEFT)
    }
    if (
      inputSystem.isTriggered(InputAction.IA_RIGHT, PointerEventType.PET_DOWN)
    ) {
      this.gameController.setSnakeDirection(Direction.RIGHT)
    }
  }
}
