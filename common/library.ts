import { initLibrary, sceneParentEntity, ui, queue, utilities } from '@dcl-sdk/mini-games/src'
import { getQueue, PlayerType } from '@dcl-sdk/mini-games/src/queue'
import { getPlayer } from '@dcl/sdk/players'
import { rotateVectorAroundCenter } from '@dcl-sdk/mini-games/src/utilities'
import { engine, Transform, TransformType, TextShape, PBTextShape, Entity, TextAlignMode, executeTask, NetworkEntity, RealmInfo } from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { isStateSyncronized, syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'
import { movePlayerTo } from '~system/RestrictedActions'
import { parseTime } from './utils/time'
import { getRealm } from '~system/Runtime'
import { Player } from '@dcl-sdk/mini-games/src/components/Player'

enum NODE_NAME {
    AREA_TOPLEFT = 'area_topLeft',
    AREA_BOTTOMRIGHT = 'area_bottomRight',
    AREA_EXITSPAWN = 'area_exitSpawn',
    AREA_PLAYSPAWN = 'area_playSpawn',
    DISPLAY_SCOREBOARD = 'display_scoreboard',
    DISPLAY_QUEUE = 'display_queue',
    LABEL_NICKNAME = 'label_nickname',
    COUNTER_TIMER = 'counter_timer',
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

const DEFAULT_SETTINGS = {
    labels: <Omit<PBTextShape, 'text' | 'textAlign'>>{
        fontSize: 3,
        textColor: Color4.White()
    },
    timeouts: {
        session: 10 * 60,
        inactivity: 15
    },
    scoreboard: {
        sortDirection: <'asc' | 'desc'>'desc',
        scale: 0.8,
        textColorMain: Color4.Black(),
        textColorSecondary: Color4.Red(),
        showButtons: true
    },
    debug: {
        disableZoneGuard: false
    }
}

function Entries<T extends {}>(obj: T): { [K in keyof T]: [K, T[K]] }[keyof T][] {
    return Object.entries(obj) as ReturnType<typeof Entries<T>>
}

export async function initMiniGame(
    id: string,
    metrics: ui.Column[],
    locators: Promise<Map<String, TransformType>>,
    callbacks: MiniGameCallbacks,
    settings: { [P in keyof typeof DEFAULT_SETTINGS]?: Partial<(typeof DEFAULT_SETTINGS)[P]> } = {}
) {
    for (let [key, value] of Entries(DEFAULT_SETTINGS)) settings[key] = { ...value, ...settings[key] }
    let { timeouts, debug, scoreboard, labels } = settings as typeof DEFAULT_SETTINGS
    const { realmInfo: { realmName } = {} } = await getRealm({})
    const environment = realmName && !realmName.match(/^LocalPreview$|.*eth$/) ? 'prd' : 'dev'
    const platform = eval('UnityOpsApi') === undefined ? 'web' : 'desktop'
    console.log(`Minigame environment: '${environment}'; Realm: ${realmName}; Platform: ${platform}; Settings: `, settings)
    // FIXME: remove when local preview will be able to pass isStateSyncronized check
    if (platform == 'web' || realmName?.match(/^LocalPreview$/)){
        executeTask(async () => RealmInfo.getOrCreateMutable(engine.RootEntity).isConnectedSceneRoom = true)
    }

    initLibrary(engine, syncEntity, players, isStateSyncronized, {
        environment,
        gameId: id,
        gameTimeoutMs: timeouts.session * 1000,
        inactiveTimeoutMs: timeouts.inactivity * 1000
    })
    const positions = validatePositionData(await locators) // TODO: account for rotation with rotateVectorAroundCenter
    let sessionTimeLeft: number | undefined
    let isActive = false
    function onActivePlayerChange(player: PlayerType | null) {
        const center = Transform.get(sceneParentEntity).position

        if (!isActive && player?.address === getPlayer()?.userId) {
            isActive = true
            movePlayerTo({
                newRelativePosition: Vector3.add(positions.get(NODE_NAME.AREA_PLAYSPAWN)!.position, center)
            })
            let elapsed = 0
            engine.addSystem(dt => sessionTimeLeft = Math.max(0, timeouts.session - (elapsed += dt)), undefined, 'countdown')
            callbacks.start()
        } else if (isActive && player?.address !== getPlayer()?.userId) {
            isActive = false
            engine.removeSystem('countdown')
            sessionTimeLeft = undefined
            callbacks.exit()
        }
    }
    if (!debug.disableZoneGuard) engine.addSystem(gameAreaChecker(
        positions.get(NODE_NAME.AREA_TOPLEFT)!.position,
        positions.get(NODE_NAME.AREA_BOTTOMRIGHT)!.position,
        positions.get(NODE_NAME.AREA_EXITSPAWN)!.position
    ))
    let activePlayer: PlayerType | null | undefined
    engine.addSystem(() => {
        const {player} = queue.getQueue().find(p => p.player.active) ?? {player: null}
        if (player?.address !== activePlayer?.address) {
            activePlayer = player
            console.log('ACTIVE PLAYER:', activePlayer)
            onActivePlayerChange(activePlayer)
        }
        updateLabels()
        forceSyncSelf()
    })

    let lastSyncTimestamp = 0
    function forceSyncSelf() {
        if (Date.now() - lastSyncTimestamp < 1000) return
        lastSyncTimestamp = Date.now()
        for (const [entity, player] of engine.getEntitiesWith(Player)) {
            if (player.address === getPlayer()?.userId) Player.getMutable(entity)
        }
    }

    function updateLabels() {
        const { minutes, seconds } = parseTime(sessionTimeLeft)
        let value = `${activePlayer ? getPlayer({ userId: activePlayer?.address })?.name : '---'}`
        if (TextShape.get(labelNickname).text != value) TextShape.getMutable(labelNickname).text = value
        value = `Next turn: ${sessionTimeLeft !== undefined ? minutes + ':' + seconds : 'now'}`
        if ((isActive || !activePlayer) && counterTimer && TextShape.get(counterTimer).text != value) {
            TextShape.getMutable(counterTimer).text = value
        }
    }
    const labelNickname = engine.addEntity()
    Transform.create(labelNickname, { ...positions.get(NODE_NAME.LABEL_NICKNAME), parent: sceneParentEntity })
    TextShape.create(labelNickname, { ...labels, text: '' })
    let counterTimer: Entity | undefined
    if (positions.has(NODE_NAME.COUNTER_TIMER)) executeTask(async () => {
        [counterTimer] = Array.from(engine.getEntitiesWith(NetworkEntity)).filter(([, {entityId}]) => entityId == 66666666)[0] ?? []
        counterTimer ??= engine.addEntity() 
        // FIXME: get rid of OrReplace cause Transform should not be synced, but in fact - it is
        Transform.createOrReplace(counterTimer, { ...positions.get(NODE_NAME.COUNTER_TIMER), parent: sceneParentEntity })
        TextShape.getOrCreateMutable(counterTimer, { ...labels, text: '', textAlign: TextAlignMode.TAM_MIDDLE_LEFT })
        syncEntity(counterTimer, [TextShape.componentId])
        NetworkEntity.createOrReplace(counterTimer, {networkId: 0, entityId: 66666666 as Entity})
    })

    new ui.ScoreBoard(
        { ...positions.get(NODE_NAME.DISPLAY_SCOREBOARD)!, scale: Vector3.One(), parent: sceneParentEntity },
        positions.get(NODE_NAME.DISPLAY_SCOREBOARD)!.scale.x,
        positions.get(NODE_NAME.DISPLAY_SCOREBOARD)!.scale.y,
        scoreboard.scale,
        metrics,
        { ...scoreboard, sortBy: metrics[0]?.type }
    )
    
    queue.initQueueDisplay(
        { ...positions.get(NODE_NAME.DISPLAY_QUEUE)!, parent: sceneParentEntity }
    )
    
    new ui.MenuButton(
        { ...positions.get(NODE_NAME.BUTTON_PLAY)!, parent: sceneParentEntity },
        ui.uiAssets.shapes.RECT_GREEN,
        ui.uiAssets.icons.playText,
        'PLAY GAME',
        () => queue.addPlayer()
    )

    new ui.MenuButton(
        { ...positions.get(NODE_NAME.BUTTON_RESTART)!, parent: sceneParentEntity },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.restart,
        'RESTART LEVEL',
        callbacks.restart
    )

    new ui.MenuButton(
        { ...positions.get(NODE_NAME.BUTTON_EXIT)!, parent: sceneParentEntity },
        ui.uiAssets.shapes.RECT_RED,
        ui.uiAssets.icons.exitText,
        'Exit from game area',
        () => queue.setNextPlayer()
    )

    new ui.MenuButton(
        { ...positions.get(NODE_NAME.BUTTON_SFX)!, parent: sceneParentEntity },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.sound,
        'Sound FX',
        callbacks.toggleSfx
    )

    new ui.MenuButton(
        { ...positions.get(NODE_NAME.BUTTON_MUSIC)!, parent: sceneParentEntity },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.music,
        'Play/Stop Music',
        callbacks.toggleMusic
    )
}

function validatePositionData(positionData: Map<String, TransformType>) {
    for (const nodeName of Object.values(NODE_NAME)) {
        if (!positionData.has(nodeName) && nodeName != NODE_NAME.COUNTER_TIMER) {
            throw new Error(`Node '${nodeName}' not found`)
        }
    }
    return positionData
}

function gameAreaChecker(topLeft: Vector3, bottomRight: Vector3, exitSpawn: Vector3) {
    let areaCheckTimer = 0
    return function gameAreaCheck(dt: number) {
        areaCheckTimer += dt

        if (areaCheckTimer < 1) return
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
