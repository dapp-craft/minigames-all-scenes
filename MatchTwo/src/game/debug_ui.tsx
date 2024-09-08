import ReactEcs, { Button, Dropdown, Input, Label, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { DEBUG_MODE_UI } from '../config'
import { queue } from '@dcl-sdk/mini-games/src'
import { flippedTileQueue, gameState } from './game'
import { Tile } from './components/idnex'
import { tilesPositions } from './tilesPositions'

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

      {/* FLIPPED TILES QUEUE */}
      {/* <UiEntity
        uiTransform={{
          width: '100%',
          height: '300px',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}
        uiBackground={{ color: Color4.Gray() }}
      >
        <Label value="Flipped tiles queue:" fontSize={FONT_SIZE} />
        {getFlippedTilesQueue()}
      </UiEntity> */}

      {/* TilesPositionOrigin */}
      {/* <UiEntity
        uiTransform={{
          width: '100%',
          // height: '300px',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}
        uiBackground={{ color: Color4.Gray() }}
      >
        <Label value="TilesPositionOrigin:" fontSize={FONT_SIZE} />
        {getTilePositions()}
      </UiEntity> */}
      
      {/* Moves */}

      <UiEntity
        uiTransform={{
          width: '100%',
          height: '30px',
          flexDirection: 'row',
          justifyContent: 'flex-end'
        }}
        uiText={{ value: `Moves: ${gameState.moves}`, fontSize: FONT_SIZE }}
      ></UiEntity>

    </UiEntity>
  </UiEntity>
)


function getFlippedTilesQueue() {
  const ret: ReactEcs.JSX.Element[] = []
  flippedTileQueue.forEach((tile, index) => {
    ret.push(
      <UiEntity
        uiBackground={{ color: Color4.Black() }}
        uiTransform={{
          width: '100%',
          height: '30px',
          flexDirection: 'row',
          justifyContent: 'flex-end'
        }}
        uiText={{ value: Tile.get(tile.mainEntity).toyModel }}
      ></UiEntity>
    )
  })
  return ret
}

function getTilePositions() {
  const ret: ReactEcs.JSX.Element[] = []
  tilesPositions.doors.forEach((door, index) => {
    ret.push(
      <UiEntity
        uiBackground={{ color: Color4.Black() }}
        uiTransform={{
          width: '100%',
          height: '30px',
          flexDirection: 'row',
          justifyContent: 'flex-end'
        }}
        uiText={{ value: `Door ${index} - ${door.rotation.x.toFixed(2)}, ${door.rotation.y.toFixed(2)}, ${door.rotation.z.toFixed(2)}, ${door.rotation.w.toFixed(2)}` }}
      ></UiEntity>
    )
  })
  return ret
}