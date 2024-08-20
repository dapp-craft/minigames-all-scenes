// We define the empty imports so the auto-complete feature works as expected.
import {} from '@dcl/sdk/math'
import { GltfContainer, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { setupStaticModels } from './staticModels'

export function main() {
  console.log("Hello, World!!")
  // Setup Environment models
  setupStaticModels()
}