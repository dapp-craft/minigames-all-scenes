import { Quaternion, Vector3, Color4 } from '@dcl/sdk/math'
import { GameController } from './gameController'
import { Position } from './objects/type'
import { Entity, GltfContainer, Material, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { readGltfLocators } from '../../../common/locators'
import { snakeBodyModel, snakeHeadModel } from '../resources'

let CELL_SIZE = 1

export class BoardRenderer {
  private _gameController: GameController
  private _entity: Entity

  private counter = 0
  private renderInterval = 1 // 6 frames per render

  private xk = 1
  private yk = 1

  private update = () => {
    // if (this.counter >= this.renderInterval) {
    //   this.render()
    //   this.counter = 0
    // } else {
    //   this.counter++
    // }
    this.render()
  }

  constructor(gameController: GameController) {
    this._entity = engine.addEntity()
    Transform.create(this._entity, {
      position: Vector3.create(0, 0, 0),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
      scale: Vector3.create(1, 1, 1)
    })
    this._gameController = gameController
    MeshRenderer.setPlane(this._entity)

    engine.addSystem(this.update)
    this.setPosition()

    // bottom left corner sphere
    const entity = engine.addEntity()
    Transform.create(entity, {
      position: Vector3.create(-0.5, -0.5, 0),
      scale: Vector3.create(0.1, 0.1, 0.1),
      parent: this._entity
    })
    MeshRenderer.setSphere(entity)
  }

  public render() {
    // console.log('In game', this._gameController.inGame)
    if (!this._gameController.inGame) return

    const boardSize = this._gameController.boardSize

    // Render Snake
    let snakePart = this._gameController.snake
    if (snakePart) {
      while (snakePart) {
        const entity = snakePart.entity
        Transform.createOrReplace(entity, {
          position: this._relativePosition(snakePart.position),
          scale: Vector3.create(1 / boardSize.width, 1 / boardSize.height, 1),
          parent: this._entity
        })

        // Choose model based on snake part or head
        let model = snakePart.prev ? snakeBodyModel : snakeHeadModel
        GltfContainer.createOrReplace(entity, model)

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
        scale: Vector3.scale(Vector3.create(1 / boardSize.width, 1 / boardSize.height, 1), 0.8)
      })
      MeshRenderer.setBox(entity)
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
    transform.position = Vector3.add(transform.position, Vector3.create(8, 0, 8))
    Transform.createOrReplace(this._entity, transform)
    this.xk = 1 / transform.scale.x
    this.yk = 1 / transform.scale.y
  }
}
