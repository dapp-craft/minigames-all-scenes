import { engine, InputAction, inputSystem, PointerEventType } from '@dcl/sdk/ecs'
import { inputAvailable } from '.'
import { carComponent, moveCar } from './selector'
import { CarDirection } from './type'

export function initKeyboardInput() {
  engine.addSystem(() => {
    if (!inputAvailable) return

    if (inputSystem.isTriggered(InputAction.IA_FORWARD, PointerEventType.PET_DOWN)) {
      if (carComponent?.direction == CarDirection.up || carComponent?.direction == CarDirection.down) {
        const directionMultiplier = carComponent.direction == CarDirection.up ? -1 : 1
        moveCar(directionMultiplier)
      }
    }
    if (inputSystem.isTriggered(InputAction.IA_BACKWARD, PointerEventType.PET_DOWN)) {
      if (carComponent?.direction == CarDirection.up || carComponent?.direction == CarDirection.down) {
        const directionMultiplier = carComponent.direction == CarDirection.up ? 1 : -1
        moveCar(directionMultiplier)
      }
    }
    if (inputSystem.isTriggered(InputAction.IA_LEFT, PointerEventType.PET_DOWN)) {
      if (carComponent?.direction == CarDirection.left || carComponent?.direction == CarDirection.right) {
        const directionMultiplier = carComponent.direction == CarDirection.left ? -1 : 1
        moveCar(directionMultiplier)
      }
    }
    if (inputSystem.isTriggered(InputAction.IA_RIGHT, PointerEventType.PET_DOWN)) {
      if (carComponent?.direction == CarDirection.left || carComponent?.direction == CarDirection.right) {
        const directionMultiplier = carComponent.direction == CarDirection.left ? 1 : -1
        moveCar(directionMultiplier)
      }
    }
  })
}
