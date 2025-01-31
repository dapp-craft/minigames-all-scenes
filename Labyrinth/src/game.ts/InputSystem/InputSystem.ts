import { engine, InputAction, inputSystem, PointerEventType } from '@dcl/sdk/ecs'
import { Board } from '../../BoardEngine/Board'
import { Direction, Position } from '../../BoardEngine/Types'
import * as utils from '@dcl-sdk/utils'
import { PLAYER_SPEED } from '../config'
import { BOARD, gameState } from '..'

const oppositeDirections: Record<Direction, Direction> = {
  [Direction.TOP]: Direction.BOTTOM,
  [Direction.BOTTOM]: Direction.TOP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT
}

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
    if (!gameState.inGame) return
    if (gameState.isMoving) return
    try {
      if (inputSystem.isTriggered(InputAction.IA_FORWARD, PointerEventType.PET_DOWN)) {
        moveUntilIntersection(this._entityId, Direction.TOP, this._board)
      }
      if (inputSystem.isTriggered(InputAction.IA_BACKWARD, PointerEventType.PET_DOWN)) {
        moveUntilIntersection(this._entityId, Direction.BOTTOM, this._board)
      }
      if (inputSystem.isTriggered(InputAction.IA_LEFT, PointerEventType.PET_DOWN)) {
        moveUntilIntersection(this._entityId, Direction.LEFT, this._board)
      }
      if (inputSystem.isTriggered(InputAction.IA_RIGHT, PointerEventType.PET_DOWN)) {
        moveUntilIntersection(this._entityId, Direction.RIGHT, this._board)
      }
    } catch (error) {
      console.log('Movement failed:', error)
    }
  }
}

async function moveUntilIntersection(entityId: number, initialDirection: Direction, board: Board): Promise<void> {
  // Move entity until you reach the intersection
  console.log("Movement started")
  let previousPosition: Position | undefined = undefined
  gameState.isMoving = true
  let intervalId = utils.timers.setInterval(() => {
    if (!BOARD.isEntityExists(entityId)) {
      utils.timers.clearInterval(intervalId)
      gameState.isMoving = false
      return
    }
    if (previousPosition == undefined) {
      previousPosition = board.getEntityPosition(entityId)
      try {
        board.moveEntityDirection(entityId, initialDirection)
      } catch (error) {
        console.log('Movement failed:', error)
        utils.timers.clearInterval(intervalId)
        gameState.isMoving = false
        return
      }
      console.log('Moving to ', previousPosition)
      return
    }

    let neighbtourPositions: Position[] = board.getCellNeighbors(board.getEntityPosition(entityId))

    if (neighbtourPositions.length == 1) {
      utils.timers.clearInterval(intervalId)
      gameState.isMoving = false
      return
    }
    
    let availablePositions: Position[] = neighbtourPositions.filter(
      (position) => board.getCellType(position.x, position.y) != 'Wall'
    )

    if (availablePositions.length > 2) {
      utils.timers.clearInterval(intervalId)
      gameState.isMoving = false
      return
    }

    let movePositions = availablePositions.filter(pos => 
      !(pos.x === previousPosition?.x && pos.y === previousPosition?.y)
    )
    if (!movePositions.length) {
      utils.timers.clearInterval(intervalId)
      gameState.isMoving = false
      return
    }

    let movePosition = movePositions[0]
    previousPosition = board.getEntityPosition(entityId)
    board.moveEntity(entityId, movePosition)
    console.log("Moving in progress")
  }, 1000 / PLAYER_SPEED)
}
