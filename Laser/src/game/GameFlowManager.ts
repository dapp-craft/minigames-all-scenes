import { engine, TransformType } from '@dcl/sdk/ecs'
import { Laser } from './Laser'
import { Mirror } from './Mirror'
import { Vector3 } from '@dcl/sdk/math'
import { LightSource } from '..'

abstract class GameFlowBaseSystem {
  mirrors: Mirror[]
  laser: Laser

  constructor(props: { laserTransform: TransformType; mirrorTransforms: TransformType[] }) {
    const { laserTransform, mirrorTransforms } = props
    this.mirrors = this.createMirrors(mirrorTransforms)
    this.laser = this.createLaser(laserTransform)
  }

  public createMirrors(mirrorTransforms: TransformType[]): Mirror[] {
    return mirrorTransforms.map((transform) => new Mirror(transform))
  }

  public createLaser(lasserTransform: TransformType): Laser {
    return new Laser(lasserTransform)
  }

  public castRay(source: LightSource): number | undefined {
    console.log('CAST:', source.getRay())
    let newSource = this.mirrors.find((m) => m.enlighten(source, this.castRay.bind(this)))
    console.log('NEW SOURCE:', newSource)
    if (newSource) return Vector3.distance(source.getRay().origin, newSource.getRay().origin)
  }

  public startGame() {
    this.castRay(this.laser)
  }

  public endGame() {
    this.mirrors.forEach((m) => {
      m.darken()
      m.removeRay()
      engine.removeEntity(m.mirrorEntity)
    })
    this.laser.removeLaser()
  }
}

export class GameFlowManager extends GameFlowBaseSystem {
  constructor(props: { laserTransform: TransformType; mirrorTransforms: TransformType[] }) {
    super(props)
  }

  public randomizeMirrorsRot() {
    this.mirrors.forEach((m) => m.createMirror(Math.floor(Math.random() * 9) * 45))
  }

  public checkIsWin() {}

  public startNextLevel() {}

  public recreateLevel() {
    this.mirrors.forEach((m) => {
      m.darken()
      m.removeRay()
      m.removeMirror()
      m.createMirror(Math.floor(Math.random() * 9) * 45)
    })
    this.startGame()
  }
}

export class SyncGameFlowManager extends GameFlowBaseSystem {
  constructor(props: { laserTransform: TransformType; mirrorTransforms: TransformType[] }) {
    super(props)
  }
}
