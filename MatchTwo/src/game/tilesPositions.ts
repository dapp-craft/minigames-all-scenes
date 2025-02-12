import { Transform, TransformType } from '@dcl/sdk/ecs'
import { readGltfLocators } from '../../../common/locators'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { sceneCenter } from '../globals'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'

export const tilesPositions: {
    toys: TransformType[],
    doors: TransformType[]
} = {
    toys: [],
    doors: []
}

const doorLocators = 'locators/obj_door.gltf'
const toyLocators = 'locators/obj_toy.gltf'

export async function setTilesPositions(){
    const toys = await readGltfLocators(toyLocators)
    const sortdetToysKeys = Array.from(toys.keys()).sort()
    tilesPositions.toys = sortdetToysKeys.map(key => toys.get(key)) as TransformType[]
    tilesPositions.toys.forEach(toy => {
        toy.position = Vector3.rotate(toy.position, Transform.get(sceneParentEntity).rotation)
        toy.rotation = Quaternion.multiply(Transform.get(sceneParentEntity).rotation, toy.rotation)
        toy.position = Vector3.add(toy.position, sceneCenter)
    })

    const doors = await readGltfLocators(doorLocators)
    const sortdetDoorsKeys = Array.from(doors.keys()).sort()
    tilesPositions.doors = sortdetDoorsKeys.map(key => doors.get(key)) as TransformType[]
    tilesPositions.doors.forEach(door => {
        door.position = Vector3.rotate(door.position, Transform.get(sceneParentEntity).rotation)
        door.rotation = Quaternion.multiply(Transform.get(sceneParentEntity).rotation, door.rotation)
        door.position = Vector3.add(door.position, sceneCenter)
    })

}