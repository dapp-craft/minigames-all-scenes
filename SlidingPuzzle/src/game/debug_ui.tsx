import ReactEcs, { Button, Dropdown, Input, Label, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { DEBUG_MODE_UI, EASY_MODE, setEasyMode } from '../config'
import { queue } from '@dcl-sdk/mini-games/src'
import { GameData } from './components/definitions'
import { gameDataEntity, gameState } from './game'

const FONT_SIZE = 16

export const debugUi = () => (
  <UiEntity
    uiTransform={{
      width: '100%',
      height: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      display: DEBUG_MODE_UI ? 'flex' : 'none'
    }}
    // uiBackground={{ color: Color4.Red() }}
  >
    <UiEntity
      uiTransform={{
        width: '20%',
        height: '80%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        margin: { top: '150px', right: '10px' }
      }}
      uiBackground={{ color: Color4.Gray() }}
    >
      {/* EASY MODE */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '50px',
          flexDirection: 'row',
          justifyContent: 'flex-end'
        }}
        uiBackground={{ color: Color4.Blue() }}
      >
        <UiEntity uiText={{ value: 'EASY MODE: ', fontSize: FONT_SIZE }}>
          <Button
            value={EASY_MODE ? 'ON' : 'OFF'}
            fontSize={FONT_SIZE}
            uiTransform={{
              height: '100%',
              width: '50px'
            }}
            onMouseDown={() => {
              setEasyMode(!EASY_MODE)
            }}
          />
        </UiEntity>
      </UiEntity>

      {/* QUEUE */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '300px',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}
        uiBackground={{ color: Color4.Gray() }}
      >
        <Label value="CURRENT PLAYER:" fontSize={FONT_SIZE} />
        <UiEntity>{getCurrentPlayer()}</UiEntity>
        <Label value="QUEUE:" fontSize={FONT_SIZE} />
        {getQueue()}
      </UiEntity>

      {/* GameData */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '150px',
          flexDirection: 'row',
          justifyContent: 'flex-end'
        }}
        uiText={{ value: getGameData(), fontSize: FONT_SIZE }}
        uiBackground={{ color: Color4.create(0.5, 0.5, 1, 1) }}
      ></UiEntity>

    {/* GameState */}
    <UiEntity
        uiTransform={{
          width: '100%',
          height: '150',
          flexDirection: 'row',
          justifyContent: 'flex-end'
        }}
        uiText={{ value: getGameState(), fontSize: FONT_SIZE }}
        uiBackground={{ color: Color4.create(0.2, 0.2, 1, 1) }}
      ></UiEntity>
    </UiEntity>
  </UiEntity>
)

function getCurrentPlayer() {
  const player = queue.getQueue()[0]
  const text = player ? player.player.address : 'No player'
  return (
    <UiEntity
      uiBackground={{ color: Color4.Black() }}
      uiTransform={{
        width: '100%',
        height: '30px',
        flexDirection: 'row',
        justifyContent: 'flex-end'
      }}
      uiText={{ value: text }}
    ></UiEntity>
  )
}

function getQueue() {
  const list = queue.getQueue()
  const ret: ReactEcs.JSX.Element[] = []
  list.forEach((player, index) => {
    ret.push(
      <UiEntity
        uiBackground={{ color: Color4.Black() }}
        uiTransform={{
          width: '100%',
          height: '30px',
          flexDirection: 'row',
          justifyContent: 'flex-end'
        }}
        uiText={{ value: player.player.address }}
      ></UiEntity>
    )
  })
  return ret
}

function getGameData(): string {
  const gameData = GameData.get(gameDataEntity)
  let res = ''
  for (const [key, value] of Object.entries(gameData)) {
    res += `${key}: ${value}\n`
  }
  return res
}

function getGameState(): string{
    let res = ''
    for (const [key, value] of Object.entries(gameState)) {
      res += `${key}: ${value}\n`
    }
    return res
}