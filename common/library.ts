import { initLibrary, sceneParentEntity, ui, queue, utilities } from '@dcl-sdk/mini-games/src'
import { getQueue, PlayerType } from '@dcl-sdk/mini-games/src/queue'
import { getPlayer } from "@dcl/sdk/players"
import { rotateVectorAroundCenter } from '@dcl-sdk/mini-games/src/utilities'
import { engine, Transform, TransformType, TextShape } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'
import { movePlayerTo } from '~system/RestrictedActions'
import { parseTime } from './utils/time'

export const SESSION_TIMEOUT = 1000 * 60 * 5 // 5 minutes
export const INACTIVITY_TIMEOUT = 1000 * 15 * 1 // 15 seconds

const SCOREBOARD_SCALE = 1.2

enum NODE_NAME {
    AREA_TOPLEFT = 'area_topLeft',
    AREA_BOTTOMRIGHT = 'area_bottomRight',
    AREA_EXITSPAWN = 'area_exitSpawn',
    AREA_PLAYSPAWN = 'area_playSpawn',
    DISPLAY_SCOREBOARD = 'display_scoreboard',
    DISPLAY_QUEUE = 'display_queue',
    LABEL_NICKNAME = 'label_nickname',
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

export async function initMiniGame(
    id: string,
    scoreboardPreset: ui.ColumnData,
    data: Promise<Map<String, TransformType>>,
    callbacks: MiniGameCallbacks,
    disableQueueGuard: boolean = false
) {
    initLibrary(engine, syncEntity, players, {
        environment: 'dev',
        gameId: id,
        gameTimeoutMs: SESSION_TIMEOUT,
        inactiveTimeoutMs: INACTIVITY_TIMEOUT,
    })
    const positionData = validatePositionData(await data) // TODO: account for rotation with rotateVectorAroundCenter
    let sessionTimeLeft: number | undefined
    let isActive = false
    function onActivePlayerChange(player: PlayerType | null) {
        const center = Transform.get(sceneParentEntity).position
        
        if (!isActive && player?.address === getPlayer()?.userId) {
            isActive = true
            movePlayerTo({
                newRelativePosition: Vector3.add(positionData.get(NODE_NAME.AREA_PLAYSPAWN)!.position, center)
            })
            let elapsed = 0
            engine.addSystem(dt => sessionTimeLeft = Math.max(0, SESSION_TIMEOUT / 1000 - (elapsed += dt)), undefined, 'countdown')
            callbacks.start()
        } else if (isActive && player?.address !== getPlayer()?.userId) {
            isActive = false
            engine.removeSystem('countdown')
            sessionTimeLeft = undefined
            callbacks.exit()
        }
    }
    if (!disableQueueGuard) engine.addSystem(gameAreaChecker(
        positionData.get(NODE_NAME.AREA_TOPLEFT)!.position,
        positionData.get(NODE_NAME.AREA_BOTTOMRIGHT)!.position,
        positionData.get(NODE_NAME.AREA_EXITSPAWN)!.position
    ))
    let activePlayer: PlayerType | null | undefined
    engine.addSystem(() => {
        const player = queue.getQueue().find(p => p.player.active)?.player ?? null
        if (player?.address !== activePlayer?.address) {
            activePlayer = player
            console.log("ACTIVE PLAYER:", activePlayer)
            onActivePlayerChange(activePlayer)
        }
        updateLabels()
    })
    

    function updateLabels() {
        const {minutes, seconds} = parseTime(sessionTimeLeft)
        const value = `
            Now playing: ${activePlayer ? getPlayer({userId: activePlayer?.address})!.name : '---'}
            Next turn: ${sessionTimeLeft !== undefined ? minutes + ':' + seconds : 'now'}
        `
        if (TextShape.get(labelNickname).text != value) TextShape.getMutable(labelNickname).text = value
    }
    const labelNickname = engine.addEntity()
    Transform.create(labelNickname, {...positionData.get(NODE_NAME.LABEL_NICKNAME), parent: sceneParentEntity})
    TextShape.create(labelNickname, {text: '', fontSize: 3})

    new ui.ScoreBoard(
        {...positionData.get(NODE_NAME.DISPLAY_SCOREBOARD)!, scale: Vector3.One(), parent: sceneParentEntity},
        positionData.get(NODE_NAME.DISPLAY_SCOREBOARD)!.scale.x,
        positionData.get(NODE_NAME.DISPLAY_SCOREBOARD)!.scale.y,
        SCOREBOARD_SCALE,
        scoreboardPreset
    )
    
    queue.initQueueDisplay(
        {...positionData.get(NODE_NAME.DISPLAY_QUEUE)!, parent: sceneParentEntity}
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
