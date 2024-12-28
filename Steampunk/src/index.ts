import { AudioSource, engine, Entity, GltfContainer, Material, MaterialTransparencyMode, MeshCollider, MeshRenderer, TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { POINTS_TIME } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { GAME_ID, gameTime, soundConfig, STEAMPUNK_SYNC_ID, steampunkGameConfig } from './gameConfig'
import { steampunkGameState } from './gameState'
import { parentEntity, syncEntity } from '@dcl/sdk/network'
import { GameLogic } from './game/gameLogic'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { getReadyToStart, initGame } from './game/game'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { setupEffects } from '../../common/effects'
import { mainThereme, SoundManager } from './game/soundManager'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

const handlers = {
    start: () => getReadyToStart(),
    exit: () => gameLogic.gameEnd(),
    restart: () => gameLogic.restartGame(),
    toggleMusic: () => playBackgroundMusic(),
    toggleSfx: () => toggleVolume()
}

const libraryReady = initMiniGame(GAME_ID, POINTS_TIME, readGltfLocators(`locators/obj_locators_default.gltf`), handlers, { timeouts: { inactivity: gameTime.inactivity, forceLimit: true } })

export let gameLogic = new GameLogic()

export const soundManager = new SoundManager()

export async function main() {
    setupEffects(Vector3.create(0, 2.7, -6));

    setupStaticModels();

    await generateInitialEntity()

    initGame()

    await libraryReady
}

const generateInitialEntity = async () => {
    for (let i = 0; i <= steampunkGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        steampunkGameState.availableEntity.push(entity)
    }

    const firstBoard = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 1]
    const secondBoard = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 2]
    // const hitZone = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 3]
    const hits = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 4]
    const visibleFeedback = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 5] // green
    const missIndicator = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 6]
    const findCounter = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 7]
    const timerEntity = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 9]
    const levelText = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 10]

    syncEntity(firstBoard, [Material.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 1)
    syncEntity(secondBoard, [Material.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 2)
    // syncEntity(hitZone, [Transform.componentId, VisibilityComponent.componentId, Material.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 3) // -
    syncEntity(visibleFeedback, [Transform.componentId, VisibilityComponent.componentId, Material.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 5) // green
    syncEntity(missIndicator, [Transform.componentId, VisibilityComponent.componentId, Material.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 6) // red
    syncEntity(findCounter, [TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 7)
    syncEntity(timerEntity, [TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 9)
    syncEntity(hits, [TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 4)
    // syncEntity(levelText, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 10)
    syncEntity(steampunkGameState.listOfEntity.get('display'), [Transform.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 11)

    for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) {
        syncEntity(steampunkGameState.availableEntity[i], [Transform.componentId, Material.componentId, VisibilityComponent.componentId], STEAMPUNK_SYNC_ID + i)
    }

    steampunkGameState.listOfEntity.set('firstBoard', firstBoard);
    steampunkGameState.listOfEntity.set('secondBoard', secondBoard);
    steampunkGameState.listOfEntity.set('hits', hits);
    // steampunkGameState.listOfEntity.set('hitZone', hitZone);
    steampunkGameState.listOfEntity.set('visibleFeedback', visibleFeedback);
    steampunkGameState.listOfEntity.set('missIndicator', missIndicator);
    steampunkGameState.listOfEntity.set('findCounter', findCounter);
    steampunkGameState.listOfEntity.set('timerEntity', timerEntity);

    steampunkGameState.locatorsData = await readGltfLocators(`locators/obj_locators_unique.gltf`)

    for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) {
        MeshRenderer.setPlane(steampunkGameState.availableEntity[i])
        MeshCollider.setPlane(steampunkGameState.availableEntity[i])
    }

    Transform.createOrReplace(firstBoard, { ...steampunkGameState.locatorsData.get('obj_screen_1') })
    Transform.createOrReplace(secondBoard, { ...steampunkGameState.locatorsData.get('obj_screen_2') })
    parentEntity(firstBoard, steampunkGameState.listOfEntity.get('display'))
    parentEntity(secondBoard, steampunkGameState.listOfEntity.get('display'))
    MeshRenderer.setPlane(firstBoard)
    MeshRenderer.setPlane(secondBoard)
    if (!Material.has(firstBoard)) {
        lightUpEntity(firstBoard, `images/1.jpg`)
    }
    if (!Material.has(secondBoard)) {
        lightUpEntity(secondBoard, `images/2.jpg`)
    }
    // if (Transform.getOrNull(hitZone) == null || MeshRenderer.getOrNull(hitZone) == null || VisibilityComponent.getOrNull(hitZone) == null || Material.getOrNull(hitZone) == null) {
    //     Transform.create(hitZone, { position: Vector3.create(0, 0, -6), rotation: Quaternion.create(1, 1, 1, 1), scale: Vector3.create(.5, 0, .5) })
    //     parentEntity(hitZone, steampunkGameState.listOfEntity.get('display'))
    //     MeshRenderer.setCylinder(hitZone)
    //     VisibilityComponent.createOrReplace(hitZone, { visible: false })
    //     Material.setPbrMaterial(hitZone, { albedoColor: Color4.create(1, 0, 0, 0.5) })
    // }

    // if (Transform.getOrNull(missIndicator) == null || MeshRenderer.getOrNull(missIndicator) == null || VisibilityComponent.getOrNull(missIndicator) == null || Material.getOrNull(missIndicator) == null) {
    //     // Transform.create(missIndicator, { position: Vector3.Zero(), rotation: Quaternion.create(0, 0, 1, 1), scale: Vector3.create(1, 1, 1) })
    //     // parentEntity(missIndicator, steampunkGameState.listOfEntity.get('display'))
    //     VisibilityComponent.createOrReplace(missIndicator, { visible: false })
    //     // Material.setPbrMaterial(missIndicator, { albedoColor: Color4.create(1, 0, 0, 0.9) })
    // }

    MeshRenderer.setPlane(missIndicator)
    MeshRenderer.setPlane(visibleFeedback)
    if (!VisibilityComponent.has(missIndicator)) {
        VisibilityComponent.createOrReplace(missIndicator, { visible: false })
    }
    if (!VisibilityComponent.has(visibleFeedback)) {
        VisibilityComponent.createOrReplace(visibleFeedback, { visible: false })
    }

    Transform.createOrReplace(hits, { ...steampunkGameState.locatorsData.get('counter_foundObjects'), parent: sceneParentEntity })
    if (!TextShape.has(hits)) {
        TextShape.create(hits, { text: 'Score \n0', fontSize: 2 })
    }
    Transform.createOrReplace(findCounter, { ...steampunkGameState.locatorsData.get('counter_score'), parent: sceneParentEntity })
    if (!TextShape.has(findCounter)) {
        TextShape.create(findCounter, { text: 'Find \n0/0', fontSize: 2 })
    }
    Transform.createOrReplace(timerEntity, { ...steampunkGameState.locatorsData.get('counter_stopwatch'), parent: sceneParentEntity })
    if (!TextShape.has(timerEntity)) {
        TextShape.create(timerEntity, { text: '', fontSize: 2 })
    }
    Transform.create(levelText, { ...steampunkGameState.locatorsData.get('label_difficulty_selection'), parent: sceneParentEntity })
    TextShape.create(levelText, { text: 'Difficult level', fontSize: 2 })
}

export const lightUpEntity = (entity: Entity, texture: string) => {
    Material.createOrReplace(entity, {
        material: {
            $case: 'pbr',
            pbr: {
                texture: {
                    tex: {
                        $case: 'texture',
                        texture: { src: texture }
                    }
                },
                emissiveColor: Color4.White(),
                emissiveIntensity: 0.8,
                emissiveTexture: {
                    tex: {
                        $case: 'texture',
                        texture: { src: texture }
                    }
                },
                roughness: 1.0,
                specularIntensity: 0,
                metallic: 0,
                transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
            }
        }
    })
}

const playBackgroundMusic = () => {
    if (AudioSource.getMutable(mainThereme).volume != 0) AudioSource.getMutable(mainThereme).volume = 0
    else AudioSource.getMutable(mainThereme).volume = 0.07
}

const toggleVolume = () => {
    if (soundConfig.volume != 0) soundConfig.volume = 0
    else soundConfig.volume = 0.5
}
