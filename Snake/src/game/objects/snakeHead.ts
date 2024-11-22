import { Entity, Transform, engine } from '@dcl/sdk/ecs'
import { Direction, Drawable, MoveDelta, Position, SnakePart } from './type'
import { SnakeBody } from './snakeBody'
import { Vector3 } from '@dcl/sdk/math'

export class SnakeHead implements SnakePart, Drawable {
  public next: SnakePart | undefined = undefined
  public prev = undefined
  private _position: Position
  private _direction: Direction = Direction.UP
  private _tail: SnakePart | undefined
  private _tailsToAdd = 0

  public entity: Entity

  constructor(pos: Position) {
    this._tail = undefined
    this.next = undefined
    this._position = pos

    this.entity = engine.addEntity()
  }

  public get position() {
    return this._position
  }

  public addTail() {
    this._tailsToAdd += 1
  }

  public set direction(dir: Direction) {
    this._direction = dir
  }

  public get direction() {
    return this._direction
  }

  public getLength() {
    let length = 1
    let next = this.next
    while (next) {
      length += 1
      next = next.next
    }
    return length
  }

  public move() {
    if (!this._tail && this._tailsToAdd == 0) {
      console.log('Moving head')
      this._moveHead()
      return
    }

    const tail = this._tail ? this._tail : this

    const tailPosition = { ...tail.position }

    // Move the tail
    let snakePart = this._tail ? this._tail : this
    while (snakePart.prev) {
      snakePart.move()
      snakePart = snakePart.prev
    }

    this._moveHead()
    // Add new tail
    if (this._tailsToAdd > 0) {
      this._tail = new SnakeBody(tailPosition, tail)
      tail.next = this._tail
      this._tailsToAdd -= 1
    }
  }

  private _moveHead() {
    const delta = MoveDelta[this._direction]
    this.position.x += delta.x
    this.position.y += delta.y
  }

  public terminate() {
    console.log('Terminating snake')
    engine.removeEntity(this.entity)
    let next = this.next
    while (next) {
      next.terminate()
      next = next.next
    }
  }
}
