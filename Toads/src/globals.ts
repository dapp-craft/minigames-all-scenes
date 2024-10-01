import { Transform, engine } from '@dcl/sdk/ecs'
import { SoundManager } from './game/soundManager'

export const sceneParentEntity = engine.addEntity()
Transform.create(sceneParentEntity, { position: { x: 8, y: 0, z: 8 } })

export const soundManager = new SoundManager()