import { Quaternion, Vector3, Color4 } from '@dcl/sdk/math'
import { GameController } from './gameController'
import { Position } from '../objects/type'
import { Entity, GltfContainer, Material, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { readGltfLocators } from '../../../../common/locators'
import { snakeBodyModel, foodModel, cellModel } from '../../resources'
import { syncEntity, parentEntity } from '@dcl/sdk/network'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'

let CELL_SIZE = 1

export class BoardRenderer {
  private _gameController: GameController
  private _entity: Entity

  private counter = 0
  private renderInterval = 1 // 6 frames per render

  private xk = 1
  private yk = 1

  private cells: Entity[] = []

  private update = () => {
     
    this.render()
  }

  constructor(gameController: GameController) {
    this._entity = engine.addEntity()
    if(!Transform.has(this._entity)) Transform.createOrReplace(this._entity, {
      position: Vector3.create(0, 0, 0),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
      scale: Vector3.create(1, 1, 1),
      parent: sceneParentEntity
    })
    this._gameController = gameController

    engine.addSystem(this.update)
    this.setPosition()
  }

  public render() {
    // console.log('In game', this._gameController.inGame)
    if (!this._gameController.inGame) return
    if (!this._gameController.isInit) return  

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
        if (!GltfContainer.getOrNull(entity)) GltfContainer.createOrReplace(entity, snakeBodyModel)

        snakePart = snakePart.next
        // console.log('Snake part rendered', snakePart)
      }
    }

    // Render Food
    const food = this._gameController.food
    if (food) {
      const entity = food.entity
      Transform.createOrReplace(entity, {
        position: this._relativePosition(food.position),
        scale: Vector3.create(1 / boardSize.width, 1 / boardSize.height, 1),
        parent: this._entity
      })

      if (!GltfContainer.getOrNull(entity)) GltfContainer.createOrReplace(entity, foodModel)

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
    this.xk = 1 / transform.scale.x
    this.yk = 1 / transform.scale.y
  }

  // private renderCells() {
  //   const boardSize = this._gameController.boardSize
  //   for (let i = 0; i < boardSize.height; i++) {
  //     for (let k = 0; k < boardSize.width; k++) {
  //       const entity = engine.addEntity()
  //       Transform.create(entity, {
  //         position: Vector3.add(this._relativePosition({ x: k, y: i }), Vector3.create(0, 0, 0.001)),
  //         scale: Vector3.create(1 / boardSize.width, 1 / boardSize.height, 1),
  //         parent: this._entity
  //       })
  //       GltfContainer.create(entity, cellModel)
  //       this.cells.push(entity)
  //     }
  //   }
  // }
}
