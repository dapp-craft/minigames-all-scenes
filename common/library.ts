import { initLibrary, sceneParentEntity, ui, queue, utilities } from '@dcl-sdk/mini-games/src'
import { getQueue } from '@dcl-sdk/mini-games/src/queue'
import { rotateVectorAroundCenter } from '@dcl-sdk/mini-games/src/utilities'
import { engine, Transform, TransformType } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'
import { movePlayerTo } from '~system/RestrictedActions'

const SESSION_DURATION = 1000 * 60 * 5 // 5 minutes
const INACTIVITY_TIMEOUT = 1000 * 15 * 1 // 15 seconds

const SCOREBOARD_WIDTH = 2.5
const SCOREBOARD_HEIGHT = 2.8
const SCOREBOARD_SCALE = 1.2

enum NODE_NAME {
    AREA_TOPLEFT = 'area_topLeft',
    AREA_BOTTOMRIGHT = 'area_bottomRight',
    AREA_EXITSPAWN = 'area_exitSpawn',
    AREA_PLAYSPAWN = 'area_playSpawn',
    SCOREBOARD = 'scoreboard',
    QUEUE_DISPLAY = 'queue_display',
    BUTTON_PLAY = 'button_play',
    BUTTON_RESTART = 'button_restart',
    BUTTON_EXIT = 'button_exit',
    BUTTON_SFX = 'button_sfx',
    BUTTON_MUSIC = 'button_music'
}
export interface MiniGameCallbacks {
    start: () => void
    exit: () => void
    restart: () => void
    toggleMusic: () => void
    toggleSfx: () => void
}

export async function initMiniGame(id: string, scoreboardPreset: ui.ColumnData, data: Promise<Map<String, TransformType>>, callbacks: MiniGameCallbacks) {
    initLibrary(engine, syncEntity, players, {
        environment: 'dev',
        gameId: id,
        gameTimeoutMs: SESSION_DURATION,
        inactiveTimeoutMs: INACTIVITY_TIMEOUT,
    })
    const positionData = validatePositionData(await data) // TODO: account for rotation with rotateVectorAroundCenter
    let isActive = false
    queue.listeners.onActivePlayerChange = player => {
        const center = Transform.get(sceneParentEntity).position
        const sceneRotation = Transform.get(sceneParentEntity).rotation
        
        if (player?.active) {
            isActive = true
            movePlayerTo({
                newRelativePosition: Vector3.add(positionData.get(NODE_NAME.AREA_PLAYSPAWN)!.position, center)
            })
            callbacks.start()
        } else if (isActive) {
            isActive = false
            callbacks.exit()
        }
    }
    engine.addSystem(gameAreaChecker(
        positionData.get(NODE_NAME.AREA_TOPLEFT)!.position,
        positionData.get(NODE_NAME.AREA_BOTTOMRIGHT)!.position,
        positionData.get(NODE_NAME.AREA_EXITSPAWN)!.position
    ))
    
    
    new ui.ScoreBoard(
        {...positionData.get(NODE_NAME.SCOREBOARD)!, parent: sceneParentEntity},
        SCOREBOARD_WIDTH,
        SCOREBOARD_HEIGHT,
        SCOREBOARD_SCALE,
        scoreboardPreset
    )
    
    queue.initQueueDisplay(
        {...positionData.get(NODE_NAME.QUEUE_DISPLAY)!, parent: sceneParentEntity}
    )
    
    new ui.MenuButton(
        {...positionData.get(NODE_NAME.BUTTON_PLAY)!, parent: sceneParentEntity},
        ui.uiAssets.shapes.RECT_GREEN,
        ui.uiAssets.icons.playText,
        'PLAY GAME',
        () => queue.addPlayer()
    )
    
    new ui.MenuButton(
        {...positionData.get(NODE_NAME.BUTTON_RESTART)!, parent: sceneParentEntity},
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.restart,
        "RESTART LEVEL",
        callbacks.restart
    )
    
    new ui.MenuButton(
        {...positionData.get(NODE_NAME.BUTTON_EXIT)!, parent: sceneParentEntity},
        ui.uiAssets.shapes.RECT_RED,
        ui.uiAssets.icons.exitText,
        'Exit from game area',
        () => queue.setNextPlayer()
    )
    
    new ui.MenuButton(
        {...positionData.get(NODE_NAME.BUTTON_SFX)!, parent: sceneParentEntity},
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.sound,
        'Sound FX',
        callbacks.toggleSfx
    )
    
    new ui.MenuButton(
        {...positionData.get(NODE_NAME.BUTTON_MUSIC)!, parent: sceneParentEntity},
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.music,
        'Play/Stop Music',
        callbacks.toggleMusic
    )
}

function validatePositionData(positionData: Map<String, TransformType>) {
    for (const nodeName of Object.values(NODE_NAME)) {
        if (!positionData.has(nodeName)) {
            throw new Error(`Node '${nodeName}' not found`);
        }
    }
    return positionData
}

function gameAreaChecker(topLeft: Vector3, bottomRight: Vector3, exitSpawn: Vector3) {
    let areaCheckTimer = 0
    return function gameAreaCheck(dt: number) {
        areaCheckTimer += dt
        
        if (areaCheckTimer >= 1) {
            areaCheckTimer = 0
            
            const playerTransform = Transform.get(engine.PlayerEntity)
            
            const center = Transform.get(sceneParentEntity).position
            const sceneRotation = Transform.get(sceneParentEntity).rotation
            const areaPt1 = Vector3.add(topLeft, center)
            const areaPt2 = Vector3.add(bottomRight, center)
            
            // If the player is inside the game-area but its not the active player.
            if (utilities.isVectorInsideArea(playerTransform.position, areaPt1, areaPt2)) {
                if (!queue.isActive()) {
                    void movePlayerTo({
                        newRelativePosition: Vector3.add(exitSpawn, center)
                    })
                }
            } else if (queue.isActive() && Date.now() - getQueue()[0]!.player.startPlayingAt > 500) {
                queue.setNextPlayer()
            }
        }
    }
}
