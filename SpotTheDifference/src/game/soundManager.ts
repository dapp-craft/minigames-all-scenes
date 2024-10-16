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

export const SOUNDS = {
  object_same: 'sounds/error.mp3',
  object_differs: 'sounds/difference-found.mp3',
  win: 'sounds/Level_Up.mp3'
}
// const mainTheme = 'sounds/Whispers_of_the_Mechanica_1.mp3'
const mainTheme = 'sounds/Steamp_loop_Orig.mp3'
const backgroundTheme = 'sounds/Clocks_Ticking.mp3'

export const THEME_VOLUME = 0.3

// export const mainThereme = engine.addEntity()
// Transform.create(mainThereme, {parent: engine.PlayerEntity})
// AudioSource.create(mainThereme, {audioClipUrl: mainThemeSound, loop: true, playing: true, volume: 0.07})

// export function toggleBackgroundMusic() {
//   let audioSource = AudioSource.getMutable(mainThereme)
//   audioSource.playing = !audioSource.playing
// }

export class SoundManager {
  private soundsStorage: Entity[] = []
  private themeVolume = THEME_VOLUME
  private themeEntity: Entity
  private backgroundEntity: Entity
  private themeStatus: boolean = true
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

    this.themeEntity = engine.addEntity()
    Transform.create(this.themeEntity, { parent: engine.PlayerEntity })
    AudioSource.create(this.themeEntity, {
      audioClipUrl: mainTheme,
      loop: true,
      playing: this.themeStatus,
      volume: this.themeVolume,
      pitch: 1,
      global: true
    })

    this.backgroundEntity = engine.addEntity()
    Transform.create(this.backgroundEntity, { parent: engine.PlayerEntity })
    AudioSource.create(this.backgroundEntity, {
      audioClipUrl: backgroundTheme,
      loop: true,
      playing: false,
      volume: this.themeVolume / 2,
      pitch: 1,
      global: true
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
    }, 10000)
  }

  public themePlaying(status: boolean) {
    AudioSource.getMutable(this.themeEntity).playing = this.themeStatus = status
    AudioSource.getMutable(this.backgroundEntity).playing = this.themeStatus = status
  }

  public background(playing: boolean, pitch: number) {
    AudioSource.getMutable(this.backgroundEntity).pitch = pitch
    utils.timers.setTimeout(() => AudioSource.getMutable(this.backgroundEntity).playing = playing && this.themeStatus, 1)
  }

  public getThemeStatus() {
    return this.themeStatus
  }
}
