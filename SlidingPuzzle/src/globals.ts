import { GltfContainer, MeshRenderer, Transform, TransformType, engine } from '@dcl/sdk/ecs'


export const sceneParentEntity = engine.addEntity()
Transform.create(sceneParentEntity, { position: { x: 8, y: 0, z: 8 } })
