import { TransformType } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { readGltfLocators } from '../../../../common/locators'

const staticUILocators = ['label_easy', 'label_medium', 'label_hard'] as const
type StaticUILocator = typeof staticUILocators[number]

export const staticUIPositions: {
  [key in StaticUILocator]: TransformType
} = {
  label_easy: {} as TransformType,
  label_medium: {} as TransformType,
  label_hard: {} as TransformType
}

export async function readStaticUIPositions() {
  const staticUILocators = await readGltfLocators('locators/obj_locators_unique.gltf')

  staticUIPositions.label_easy = staticUILocators.get('label_easy') as TransformType
  staticUIPositions.label_medium = staticUILocators.get('label_medium') as TransformType
  staticUIPositions.label_hard = staticUILocators.get('label_hard') as TransformType

  staticUIPositions.label_easy.position = Vector3.add(staticUIPositions.label_easy.position, Vector3.create(8, 0, 8))
  staticUIPositions.label_medium.position = Vector3.add(staticUIPositions.label_medium.position, Vector3.create(8, 0, 8))
  staticUIPositions.label_hard.position = Vector3.add(staticUIPositions.label_hard.position, Vector3.create(8, 0, 8))

  console.log("Static locators", staticUILocators)
}
