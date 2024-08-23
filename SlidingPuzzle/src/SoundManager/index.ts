import {
  AudioSource,
  AudioStream,
  engine,
  Entity,
  MeshCollider,
  MeshRenderer,
  Transform,
  MediaState
} from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { Vector3 } from '@dcl/sdk/math'
import { slideSound } from '../resources/resources'

export let SOUNDS: { [key: string]: string } = {
  "slide": slideSound
}

const STREAM_VOLUME_DELTA = 0.05
const STREAM_VOUME_MAX = 0.025
// export const mainThereme = engine.addEntity()
// Transform.create(mainThereme, {parent: engine.PlayerEntity})
// AudioSource.create(mainThereme, {audioClipUrl: `sounds/futuristic-abstract-chill.mp3`, loop: true, playing: true, volume: 0.07})

export class SoundManager {
  private soundsStorage: Entity[] = []
  private themeVolume = 0
  private currentThemeIndex: number = 0
  constructor() {
    console.log('SoundManager constructor')
    console.log('SOUNDS', SOUNDS)
    Object.keys(SOUNDS).forEach((key) => {
      let ent = engine.addEntity()
      AudioSource.create(ent, {
        audioClipUrl: `${SOUNDS[key as keyof typeof SOUNDS]}`,
        loop: false,
        playing: false
      })
      this.soundsStorage.push(ent)
    })
  }

  public playSound(soundName: keyof typeof SOUNDS, volume: number = 0.5) {
    console.log('Play sound', soundName)
    console.log('audioClipUrl: ', `${SOUNDS[soundName as keyof typeof SOUNDS]}`)
    let soundEntity = engine.addEntity()
    Transform.create(soundEntity, { parent: engine.PlayerEntity })
    AudioSource.create(soundEntity, {
      audioClipUrl: `${SOUNDS[soundName as keyof typeof SOUNDS]}`,
      loop: false,
      playing: false,
      pitch: Math.random() * 0.2 + 0.8
    })
    let audioSource = AudioSource.getMutable(soundEntity)
    audioSource.volume = volume
    audioSource.playing = true
    utils.timers.setTimeout(() => {
      audioSource.playing = false
      engine.removeEntity(soundEntity)
    }, 2000)
  }

}
