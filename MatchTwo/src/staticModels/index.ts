import { GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { staticModels } from '../resources/resources'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'

export const setupStaticModels = () => {
    staticModels.forEach((model) => {
        const enitity = engine.addEntity()
        // TODO move scene center to a global variable
        Transform.create(enitity, { parent: sceneParentEntity })
        GltfContainer.create(enitity, model)
    })
}