import * as utils from '@dcl-sdk/utils'
import { engine, executeTask, GltfContainer, InputAction, Material, MeshCollider, MeshRenderer, pointerEventsSystem, TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { MOVES, POINTS_TIME, SCORE, TIME, TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { GAME_ID, STEAMPUNK_SYNC_ID, steampunkGameConfig } from './gameConfig'
import { steampunkGameState } from './gameState'
import { syncEntity } from '@dcl/sdk/network'
import { GameLogic } from './game/gameLogic'
import { setupStaticModels } from './staticModels/setupStaticModels'
import { getReadyToStart, initGame } from './game/game'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { setupEffects } from '../../common/effects'
import { SoundManager } from './game/soundManager'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

//temp
const handlers = {
    start: () => getReadyToStart(),
    exit: () => { gameLogic.gameEnd() },
    restart: () => getReadyToStart(),
    toggleMusic: () => { },
    toggleSfx: () => { }
}

const libraryReady = initMiniGame(GAME_ID, POINTS_TIME, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

export let gameLogic = new GameLogic()

export const soundManager = new SoundManager()

export async function main() {
    setupEffects(Vector3.create(0, 2.5, -4.3));

    await libraryReady

    setupStaticModels();

    await generateInitialEntity()

    initGame()
}

const generateInitialEntity = async () => {

    // TODO SYNC

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

    syncEntity(firstBoard, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 1)
    syncEntity(secondBoard, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 2)
    syncEntity(hitZone, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 3)
    syncEntity(hits, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 4)
    syncEntity(hitZone, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 5)
    syncEntity(missIndicator, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 6)
    syncEntity(findCounter, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 7)

    for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) syncEntity(steampunkGameState.availableEntity[i], [Transform.componentId, GltfContainer.componentId], STEAMPUNK_SYNC_ID + i)

    steampunkGameState.listOfEntity.set('firstBoard', firstBoard);
    steampunkGameState.listOfEntity.set('secondBoard', secondBoard);
    steampunkGameState.listOfEntity.set('hits', hits);
    steampunkGameState.listOfEntity.set('hitZone', hitZone);
    steampunkGameState.listOfEntity.set('visibleFeedback', visibleFeedback);
    steampunkGameState.listOfEntity.set('missIndicator', missIndicator);
    steampunkGameState.listOfEntity.set('findCounter', findCounter);

    console.log(Transform.get(steampunkGameState.listOfEntity.get('display')))

    const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)

    Transform.create(firstBoard, { ...data.get('obj_screen_1'), parent: steampunkGameState.listOfEntity.get('display') })
    Transform.create(secondBoard, { ...data.get('obj_screen_2'), parent: steampunkGameState.listOfEntity.get('display') })
    Transform.create(hitZone, { position: Vector3.create(0, 0, -6), rotation: Quaternion.create(1, 1, 1, 1), scale: Vector3.create(.5, 0, .5), parent: steampunkGameState.listOfEntity.get('display') })
    Transform.create(missIndicator, { position: {...Transform.get(hitZone).position, z: Transform.get(hitZone).position.z + .001}, rotation: Quaternion.create(0, 0, 1, 1), scale: Vector3.create(1, 1, 1), parent: steampunkGameState.listOfEntity.get('display') })

    MeshRenderer.setPlane(firstBoard)
    MeshRenderer.setPlane(secondBoard)
    MeshRenderer.setPlane(missIndicator)

    // MeshCollider.setPlane(firstBoard)
    // MeshCollider.setPlane(secondBoard)

    MeshRenderer.setCylinder(hitZone)
    MeshRenderer.setPlane(visibleFeedback)

    Material.setPbrMaterial(steampunkGameState.listOfEntity.get('firstBoard'), { texture: Material.Texture.Common({ src: `images/scene-thumbnail.png` }) })
    Material.setPbrMaterial(steampunkGameState.listOfEntity.get('secondBoard'), { texture: Material.Texture.Common({ src: `images/scene-thumbnail.png` }) })

    VisibilityComponent.createOrReplace(hitZone, { visible: false })
    VisibilityComponent.createOrReplace(visibleFeedback, { visible: false })
    VisibilityComponent.createOrReplace(missIndicator, { visible: false })

    Material.setPbrMaterial(hitZone, { albedoColor: Color4.create(1, 0, 0, 0.5) })
    Material.setPbrMaterial(visibleFeedback, { albedoColor: Color4.create(0, 1, 0, 0.5) })
    Material.setPbrMaterial(missIndicator, { albedoColor: Color4.create(1, 0, 0, 0.9) })

    if (Transform.getOrNull(hits) == null || TextShape.getOrNull(hits) == null) {
        Transform.create(hits, { ...data.get('counter_foundObjects'), parent: sceneParentEntity })
        TextShape.create(hits, { text: 'Hits \n0', fontSize: 2 })
    }
    if (Transform.getOrNull(findCounter) == null || TextShape.getOrNull(findCounter) == null) {
        Transform.create(findCounter, { ...data.get('counter_foundObjects'), position: {...data.get('counter_foundObjects')!.position, x: data.get('counter_foundObjects')!.position.x - 1.5}, parent: sceneParentEntity })
        TextShape.create(findCounter, { text: 'Find \n0/0', fontSize: 2 })
    }
}
