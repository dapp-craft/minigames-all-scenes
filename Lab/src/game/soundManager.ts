import { AudioSource, engine, Entity, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { GAME_SOUNDS, THEME_SOUND } from '../resources'
import { THEME_VOLUME } from '../settings/constants'

export class SoundManager {
    private themeEntity: Entity
    private themeStatus = true
    private soundsStatus = true
    public get themePlaying() {
        return this.themeStatus
    }
    public get soundsEnabled() {
        return this.soundsStatus
    }
    constructor() {
        console.log('SoundManager::constructor')
        console.log('SOUNDS', GAME_SOUNDS)

        Object.keys(GAME_SOUNDS).forEach(key => {
            AudioSource.create(engine.addEntity(), {
                audioClipUrl: `${GAME_SOUNDS[key as keyof typeof GAME_SOUNDS]}`,
                loop: false,
                playing: false
            })
        })

        this.themeEntity = engine.addEntity()
        Transform.create(this.themeEntity, {
            parent: engine.CameraEntity
        })
        AudioSource.create(this.themeEntity, {
            audioClipUrl: THEME_SOUND,
            loop: true,
            playing: this.themeStatus,
            volume: THEME_VOLUME
        })
    }

    public playSound(soundName: keyof typeof GAME_SOUNDS, delay: number = 0, volume: number = 0.7) {
        if (!this.soundsStatus) return
        console.log(`Play sound '${soundName}, delay ${delay}`)
        let soundEntity = engine.addEntity()
        Transform.create(soundEntity, { parent: engine.PlayerEntity })
        utils.timers.setTimeout(() => AudioSource.create(soundEntity, {
            audioClipUrl: `${GAME_SOUNDS[soundName as keyof typeof GAME_SOUNDS]}`,
            loop: false,
            playing: true,
            pitch: Math.random() * 0.4 + 0.8,
            volume
        }), delay)
        utils.timers.setTimeout(() => {
            AudioSource.getMutable(soundEntity).playing = false
            engine.removeEntity(soundEntity)
        }, delay + 2000)
    }

    public toggleTheme(status: boolean) {
        this.themeStatus = status
        AudioSource.getMutable(this.themeEntity).playing = this.themeStatus
    }
    public toggleSounds(status: boolean) {
        this.soundsStatus = status
    }
}
