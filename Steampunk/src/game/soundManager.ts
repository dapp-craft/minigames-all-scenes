import {
    AudioSource,
    engine,
    Entity,
    Transform  } from '@dcl/sdk/ecs'
  import * as utils from '@dcl-sdk/utils'
import { correct, incorrect } from '../resources/resources'
  
  export let SOUNDS: { [key: string]: string } = {
    "correct": correct, 
    "incorrect": incorrect,
  }
  
  export let THEME = ''
  export const THEME_VOLUME = 0.7
  
  export const mainThereme = engine.addEntity()
  Transform.create(mainThereme, {parent: engine.PlayerEntity})
  AudioSource.create(mainThereme, {audioClipUrl: `sounds/Toads_theme.mp3`, loop: true, playing: true, volume: 0.07})
  
  export class SoundManager {
    private soundsStorage: Entity[] = []
    private themeVolume = THEME_VOLUME
    private themeEntity: Entity
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
      AudioSource.create(this.themeEntity, {
        audioClipUrl: THEME,
        loop: true,
        playing: this.themeStatus,
        volume: this.themeVolume
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
  
    public themePlaying(status: boolean) {
      this.themeStatus = status
      let audioSource = AudioSource.getMutable(this.themeEntity)
      audioSource.playing = this.themeStatus
    }
  
    public getThemeStatus() {
      return this.themeStatus
    }
  
  
  }
  