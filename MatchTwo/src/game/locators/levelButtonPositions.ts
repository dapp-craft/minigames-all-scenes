import { TransformType } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { readGltfLocators } from '../../../../common/locators'
import { sceneCenter } from '../../globals'

const locatorsNames = ['button_level_1', 'button_level_2', 'button_level_3', 'button_level_4', 'button_level_5']

export const levelButtonPositions: {
  levelButtons: TransformType[]
} = {
  levelButtons: []
}

export async function setLevelButtonPositions() {
  const levelButtonLocators = 'locators/obj_locators_unique.gltf'
  const levelButtons = await readGltfLocators(levelButtonLocators)
  const sortdetLevelButtonsKeys = Array.from(levelButtons.keys())
    .sort()
    .filter((key) => locatorsNames.includes(key as string))
  levelButtonPositions.levelButtons = sortdetLevelButtonsKeys.map((key) => levelButtons.get(key)) as TransformType[]
  levelButtonPositions.levelButtons.forEach((levelButton) => {
    levelButton.position = Vector3.add(levelButton.position, sceneCenter)
  })
}
