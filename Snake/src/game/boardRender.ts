import { Quaternion, Vector3, Color4 } from '@dcl/sdk/math'
import { GameController } from './gameController'
import { Position } from './objects/type'
import { Entity, Material, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'

const CELL_SIZE = 1 / 4

export class BoardRenderer {
  private _gameController: GameController
  private _entity: Entity

  private counter = 0
  private renderInterval = 1 // 6 frames per render

  private update = () => {
    // if (this.counter >= this.renderInterval) {
    //   this.render()
    //   this.counter = 0
    // } else {
    //   this.counter++
    // }
    this.render()
  }

  constructor(boardPosition: Vector3, gameController: GameController) {
    this._entity = engine.addEntity()
    Transform.create(this._entity, {
      position: boardPosition,
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
      scale: Vector3.create(CELL_SIZE, CELL_SIZE, CELL_SIZE)
    })
    this._gameController = gameController

    engine.addSystem(this.update)
  }

  public render() {
    // console.log('In game', this._gameController.inGame)
    if (!this._gameController.inGame) return
    // Render Snake
    let snakePart = this._gameController.snake
    if (snakePart) {
      while (snakePart) {
        const entity = snakePart.entity
        Transform.createOrReplace(entity, {
          position: this._relativePosition(snakePart.position),
          parent: this._entity
        })
        MeshRenderer.setBox(entity)
        snakePart = snakePart.next
        // console.log('Snake part rendered', snakePart)
      }
    }

    // Render Food
    const food = this._gameController.food
    if (food) {
      const entity = food.entity
      Material.setPbrMaterial(entity, {
        albedoColor: Color4.Red()
      })
      Transform.createOrReplace(entity, {
        position: this._relativePosition(food.position),
        parent: this._entity,
        scale: Vector3.create(0.8, 0.8, 0.8)
      })
      MeshRenderer.setBox(entity)
    }
  }

  private _relativePosition(pos: Position) {
    const boardSize = this._gameController.boardSize

    // 0, 0 is the left bottom corner
    let x
    if (boardSize.width % 2 === 0) {
      x = pos.x - boardSize.width / 2 + CELL_SIZE / 2
    } else {
      x = pos.x - Math.floor(boardSize.width / 2)
    }

    let y
    if (boardSize.height % 2 === 0) {
      y = pos.y - boardSize.height / 2 + CELL_SIZE / 2
    } else {
      y = pos.y - Math.floor(boardSize.height / 2)
    }

    return { x: x, y: y, z: 0 }
  }
}
