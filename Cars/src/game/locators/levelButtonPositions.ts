import { TransformType } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { readGltfLocators } from '../../../../common/locators'

const easy_levels = ['button_easy_1', 'button_easy_2', 'button_easy_3', 'button_easy_4', 'button_easy_5']
const medium_levels = ['button_medium_1', 'button_medium_2', 'button_medium_3', 'button_medium_4', 'button_medium_5']
const hard_levels = ['button_hard_1', 'button_hard_2', 'button_hard_3', 'button_hard_4', 'button_hard_5']

export const levelButtonPositions: {
  "EASY": TransformType[]
  "MEDIUM": TransformType[]
  "HARD": TransformType[]
} = {
  "EASY": [],
  "MEDIUM": [],
  "HARD": []
}

export async function setLevelButtonPositions() {
  const levelButtonLocators = 'locators/obj_locators_unique.gltf'
  const levelButtons = await readGltfLocators(levelButtonLocators)
  
  levelButtonPositions["EASY"] = easy_levels.map((key) => levelButtons.get(key)) as TransformType[]
  levelButtonPositions["MEDIUM"] = medium_levels.map((key) => levelButtons.get(key)) as TransformType[]
  levelButtonPositions["HARD"] = hard_levels.map((key) => levelButtons.get(key)) as TransformType[]

  levelButtonPositions["EASY"].forEach((levelButton) => {
    levelButton.position = Vector3.add(levelButton.position, Vector3.create(8, 0, 8))
  })
  levelButtonPositions["MEDIUM"].forEach((levelButton) => {
    levelButton.position = Vector3.add(levelButton.position, Vector3.create(8, 0, 8))
  })
  levelButtonPositions["HARD"].forEach((levelButton) => {
    levelButton.position = Vector3.add(levelButton.position, Vector3.create(8, 0, 8))
  })
}
