import { TransformType } from '@dcl/sdk/ecs'
import { readGltfLocators } from '../../../../common/locators'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { sceneCenter } from '../../globals'

const locatorsNames = ['counter_foundPairs', 'counter_stopwatch', 'counter_moves']
export let statusBoardPositions: {
  counter_foundPairs: TransformType
  counter_stopwatch: TransformType
  counter_moves: TransformType
} = {
  counter_foundPairs: { position: Vector3.Zero(), rotation: Quaternion.Identity(), scale: Vector3.One() },
  counter_stopwatch: { position: Vector3.Zero(), rotation: Quaternion.Identity(), scale: Vector3.One() },
  counter_moves: { position: Vector3.Zero(), rotation: Quaternion.Identity(), scale: Vector3.One() }
}

export async function setStatusBoardPositions() {
  const statusBoardLocators = 'locators/obj_locators_unique.gltf'
  const statusBoard = await readGltfLocators(statusBoardLocators)
  ;(statusBoardPositions.counter_foundPairs = statusBoard.get('counter_foundPairs') as TransformType),
    (statusBoardPositions.counter_stopwatch = statusBoard.get('counter_stopwatch') as TransformType),
    (statusBoardPositions.counter_moves = statusBoard.get('counter_moves') as TransformType)

  statusBoardPositions.counter_foundPairs.position = Vector3.add(
    statusBoardPositions.counter_foundPairs.position,
    sceneCenter
  )
  statusBoardPositions.counter_stopwatch.position = Vector3.add(
    statusBoardPositions.counter_stopwatch.position,
    sceneCenter
  )
  statusBoardPositions.counter_moves.position = Vector3.add(statusBoardPositions.counter_moves.position, sceneCenter)
  console.log('Sttatus Board', statusBoardPositions)
}
