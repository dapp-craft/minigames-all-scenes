import { Transform, engine } from '@dcl/sdk/ecs'
import { SoundManager } from './SoundManager'
import { Vector3 } from '@dcl/sdk/math'

export const sceneCenter: Vector3 = { x: 8, y: 0, z: 8 }


export const sceneParentEntity = engine.addEntity()
Transform.create(sceneParentEntity, { position: sceneCenter })


export const soundManager = new SoundManager()