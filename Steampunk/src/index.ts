import * as utils from '@dcl-sdk/utils'
import { engine, executeTask, GltfContainer, Material, MeshCollider, MeshRenderer, TextShape, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { STEAMPUNK_SYNC_ID, steampunkGameConfig } from './gameConfig'
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

const libraryReady = initMiniGame('', TIME_LEVEL_MOVES, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

export let gameLogic = new GameLogic()

export const soundManager = new SoundManager()

export async function main() {
    setupEffects(Vector3.create(0, 2.5, -4.3));

    await libraryReady

    await setupStaticModels()

    await generateInitialEntity()

    initGame()

    let res = await gameLogic.startGame()

    console.log("Response after game: ")
    console.log(res)
}

const generateInitialEntity = async () => {

    // TODO SYNC

    for (let i = 0; i <= steampunkGameConfig.initialEntityAmount; i++) {
        const entity = engine.addEntity()
        steampunkGameState.availableEntity.push(entity)
    }

    const hitZone = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 1]
    const firstBoard = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 2]
    const secondBoard = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 3]
    const hits = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 4]
    const visibleFeedback = steampunkGameState.availableEntity[steampunkGameConfig.targetEntityAmount + 5]

    syncEntity(hitZone, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 1)
    syncEntity(firstBoard, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 2)
    syncEntity(secondBoard, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 3)
    syncEntity(hits, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 4)
    syncEntity(hitZone, [Transform.componentId, TextShape.componentId], STEAMPUNK_SYNC_ID + steampunkGameConfig.targetEntityAmount + 5)

    for (let i = 0; i < steampunkGameConfig.targetEntityAmount; i++) syncEntity(steampunkGameState.availableEntity[i], [Transform.componentId, GltfContainer.componentId], STEAMPUNK_SYNC_ID + i)

    steampunkGameState.listOfEntity.set('firstBoard', firstBoard);
    steampunkGameState.listOfEntity.set('secondBoard', secondBoard);
    steampunkGameState.listOfEntity.set('hits', hits);
    steampunkGameState.listOfEntity.set('hitZone', hitZone);
    steampunkGameState.listOfEntity.set('visibleFeedback', visibleFeedback);

    console.log(Transform.get(steampunkGameState.listOfEntity.get('display')))

    const data = await readGltfLocators(`locators/obj_locators_unique1.gltf`)

    Transform.create(firstBoard, { ...data.get('Image1'), parent: steampunkGameState.listOfEntity.get('display') })
    Transform.create(secondBoard, { ...data.get('Image2'), parent: steampunkGameState.listOfEntity.get('display') })
    Transform.create(hitZone, { position: Vector3.create(0, 0, -6), rotation: Quaternion.create(1, 1, 1, 1), scale: Vector3.create(.5, 0, .5), parent: steampunkGameState.listOfEntity.get('display') })
    Transform.create(visibleFeedback, { position: Vector3.create(0, 0, -6), rotation: Quaternion.create(1, 1, 1, 1), scale: Vector3.create(.3, 0, .3), parent: steampunkGameState.listOfEntity.get('display') })

    MeshRenderer.setPlane(firstBoard)
    MeshRenderer.setPlane(secondBoard)
    MeshRenderer.setCylinder(hitZone)
    MeshRenderer.setCylinder(visibleFeedback)

    VisibilityComponent.createOrReplace(hitZone, { visible: false })
    VisibilityComponent.createOrReplace(visibleFeedback, { visible: false })

    Material.setPbrMaterial(hitZone, { albedoColor: Color4.create(1, 0, 0, 0.5) })
    Material.setPbrMaterial(visibleFeedback, { albedoColor: Color4.create(0, 1, 0, 0.5) })

    if (Transform.getOrNull(hits) == null || TextShape.getOrNull(hits) == null) {
        Transform.create(hits, { ...data.get('Counter'), parent: sceneParentEntity })
        TextShape.create(hits, { text: 'Hits \n0', fontSize: 2 })
    }
}
