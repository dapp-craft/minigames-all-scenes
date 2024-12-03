import { AudioSource, engine, Entity, GltfContainer, Material, MaterialTransparencyMode, MeshCollider, MeshRenderer, TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { POINTS_TIME } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { GAME_ID, soundConfig, STEAMPUNK_SYNC_ID, steampunkGameConfig } from './gameConfig'
import { steampunkGameState } from './gameState'
import { parentEntity, syncEntity } from '@dcl/sdk/network'
import { GameLogic } from './game/gameLogic'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { getReadyToStart, initGame } from './game/game'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { setupEffects } from '../../common/effects'
import { mainThereme, SoundManager } from './game/soundManager'
import { init } from './game/cameraEntity'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

//temp
const handlers = {
    start: () => getReadyToStart(),
    exit: () => { gameLogic.gameEnd() },
    restart: () => getReadyToStart(),
    toggleMusic: () => playBackgroundMusic(),
    toggleSfx: () => toggleVolume()
}

const libraryReady = initMiniGame(GAME_ID, POINTS_TIME, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

export let gameLogic = new GameLogic()

export const soundManager = new SoundManager()

export async function main() {
    setupEffects(Vector3.create(0, 2.7, -6));

    await libraryReady

    setupStaticModels();

    await generateInitialEntity()

    initGame()

    init()
}

const generateInitialEntity = async () => {
    for (let i = 0; i <= steampunkGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        steampunkGameState.availableEntity.push(entity)
    }

    const firstBoard = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 1]
    const secondBoard = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 2]
    const hitZone = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 3]
    const hits = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 4]
    const visibleFeedback = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 5]
    const missIndicator = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 6]
    const findCounter = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 7]

    syncEntity(steampunkGameState.listOfEntity.get('display'), [Transform.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 10)
    syncEntity(firstBoard, [Transform.componentId, MeshRenderer.componentId, Material.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 1)
    syncEntity(secondBoard, [Transform.componentId, MeshRenderer.componentId, Material.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 2)
    syncEntity(hitZone, [Transform.componentId, MeshRenderer.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 3)
    syncEntity(hits, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 4)
    syncEntity(hitZone, [Transform.componentId, MeshRenderer.componentId, VisibilityComponent.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 5)
    syncEntity(missIndicator, [Transform.componentId, MeshRenderer.componentId, VisibilityComponent.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 6)
    syncEntity(findCounter, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 7)
    syncEntity(visibleFeedback, [Transform.componentId, MeshRenderer.componentId, VisibilityComponent.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 8)

    for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) {
        syncEntity(steampunkGameState.availableEntity[i], [Transform.componentId, Material.componentId, VisibilityComponent.componentId], STEAMPUNK_SYNC_ID + i)
    }

    steampunkGameState.listOfEntity.set('firstBoard', firstBoard);
    steampunkGameState.listOfEntity.set('secondBoard', secondBoard);
    steampunkGameState.listOfEntity.set('hits', hits);
    steampunkGameState.listOfEntity.set('hitZone', hitZone);
    steampunkGameState.listOfEntity.set('visibleFeedback', visibleFeedback);
    steampunkGameState.listOfEntity.set('missIndicator', missIndicator);
    steampunkGameState.listOfEntity.set('findCounter', findCounter);

    console.log(Transform.get(steampunkGameState.listOfEntity.get('display')))

    const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)

    for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) {
        if (Transform.getOrNull(steampunkGameState.availableEntity[i]) == null) {
            MeshRenderer.setPlane(steampunkGameState.availableEntity[i])
            MeshCollider.setPlane(steampunkGameState.availableEntity[i])
        }
    }
    if (Transform.getOrNull(firstBoard) == null) {
        Transform.create(firstBoard, { ...data.get('obj_screen_1')})
        parentEntity(firstBoard, steampunkGameState.listOfEntity.get('display'))
        MeshRenderer.setPlane(firstBoard)
        Material.setPbrMaterial(firstBoard, { texture: Material.Texture.Common({ src: `images/scene-thumbnail.png` }) })
    }
    if (Transform.getOrNull(secondBoard) == null) {
        Transform.create(secondBoard, { ...data.get('obj_screen_2') })
        parentEntity(secondBoard, steampunkGameState.listOfEntity.get('display'))
        MeshRenderer.setPlane(secondBoard)
        Material.setPbrMaterial(secondBoard, { texture: Material.Texture.Common({ src: `images/scene-thumbnail.png` }) })
    }
    if (Transform.getOrNull(hitZone) == null) {
        Transform.create(hitZone, { position: Vector3.create(0, 0, -6), rotation: Quaternion.create(1, 1, 1, 1), scale: Vector3.create(.5, 0, .5)})
        parentEntity(hitZone, steampunkGameState.listOfEntity.get('display'))
        MeshRenderer.setCylinder(hitZone)
        VisibilityComponent.createOrReplace(hitZone, { visible: false })
        Material.setPbrMaterial(hitZone, { albedoColor: Color4.create(1, 0, 0, 0.5) })
    }
    if (Transform.getOrNull(missIndicator) == null) {
        Transform.create(missIndicator, { position: { ...Transform.get(hitZone).position, z: Transform.get(hitZone).position.z + .001 }, rotation: Quaternion.create(0, 0, 1, 1), scale: Vector3.create(1, 1, 1) })
        parentEntity(missIndicator, steampunkGameState.listOfEntity.get('display'))
        MeshRenderer.setPlane(missIndicator)
        VisibilityComponent.createOrReplace(missIndicator, { visible: false })
        Material.setPbrMaterial(missIndicator, { albedoColor: Color4.create(1, 0, 0, 0.9) })
    }
    if (Transform.getOrNull(visibleFeedback) == null) {
        MeshRenderer.setPlane(visibleFeedback)
        VisibilityComponent.createOrReplace(visibleFeedback, { visible: false })
        Material.setPbrMaterial(visibleFeedback, { albedoColor: Color4.create(0, 1, 0, 0.5) })
    }
    if (Transform.getOrNull(hits) == null || TextShape.getOrNull(hits) == null) {
        Transform.create(hits, { ...data.get('counter_foundObjects'), parent: sceneParentEntity })
        TextShape.create(hits, { text: 'Score \n0', fontSize: 2 })
    }
    if (Transform.getOrNull(findCounter) == null || TextShape.getOrNull(findCounter) == null) {
        Transform.create(findCounter, { ...data.get('counter_score'), parent: sceneParentEntity })
        TextShape.create(findCounter, { text: 'Find \n0/0', fontSize: 2 })
    }
    lightUpEntity(firstBoard, `images/scene-thumbnail.png`)
    lightUpEntity(secondBoard, `images/scene-thumbnail.png`)
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
                emissiveIntensity: 0.9,
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
