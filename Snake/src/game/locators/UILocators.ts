import { TransformType } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { readGltfLocators } from '../../../../common/locators'

export const UiLocatorsNames = ['counter_score']

export const UiLocators: Record<string, TransformType> = {}

export async function setLevelUiPositions() {
  const UILocatorsPath = 'locators/obj_locators_unique.gltf'
  const locators = await readGltfLocators(UILocatorsPath)
  const locatorsKeys = Array.from(locators.keys()).filter((key) => UiLocatorsNames.includes(key as string))
  const transforms = locatorsKeys.forEach((key) => {
    UiLocators[key as string] = locators.get(key) as TransformType
    UiLocators[key as string].position = Vector3.add(UiLocators[key as string].position, Vector3.create(8, 0, 8))
  })
}
