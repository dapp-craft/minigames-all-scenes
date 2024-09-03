import { PBGltfContainer } from '@dcl/sdk/ecs'

const modelsFolder = 'models/'
const imagesFolder = 'images/'


export const tileShape: PBGltfContainer = { src: modelsFolder + 'obj_tile.gltf' }

export const tileImages: PBGltfContainer[] = [
  { src: imagesFolder + 'tileImages/adidas.png' },
  { src: imagesFolder + 'tileImages/amd.png' },
  { src: imagesFolder + 'tileImages/apple.png' },
  { src: imagesFolder + 'tileImages/discord.png' },
  { src: imagesFolder + 'tileImages/rwxrwxrwxdocker.png' },
  { src: imagesFolder + 'tileImages/rwxrwxrwxibm.png' },
  { src: imagesFolder + 'tileImages/rwxrwxrwxintel.png' },
  { src: imagesFolder + 'tileImages/linux.png' },
  { src: imagesFolder + 'tileImages/mcdonalds.png' },
  { src: imagesFolder + 'tileImages/messenger.png' },
  { src: imagesFolder + 'tileImages/netflix.png' },
  { src: imagesFolder + 'tileImages/rwxrwxrwxnike.png' },
  { src: imagesFolder + 'tileImages/rwxrwxrwxoracle.png' },
  { src: imagesFolder + 'tileImages/rwxrwxrwxsamsung.png' },
  { src: imagesFolder + 'tileImages/telegram.png' },
  { src: imagesFolder + 'tileImages/rwxrwxrwxtwitch.png' },
  { src: imagesFolder + 'tileImages/unity.png' },
  { src: imagesFolder + 'tileImages/windows.png' },
  { src: imagesFolder + 'tileImages/xbox.png' }
]
