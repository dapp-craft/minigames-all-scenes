import { Color4 } from "@dcl/sdk/math";
import * as utils from '@dcl-sdk/utils'
import ReactEcs, { Button, Input, Label, UiEntity } from "@dcl/sdk/react-ecs";

let dots = '...'

let interval: number | undefined
export function showSyncLoader() {
  if (interval) return
  let dotCount = 3;
  interval = utils.timers.setInterval(() => {
    if (dotCount === 3) {
      dotCount = 1;
    } else {
      dotCount++;
    }
    dots = '.'.repeat(dotCount);
    return dots
  }, 400)
}
export function hideSyncLoader() {
  if (interval) interval = void utils.timers.clearInterval(interval)
}

export const uiComponent = () => (
  <UiEntity
    uiTransform={{
      width: 300,
      height: 70,
      position: '80% 50%',
      margin: -150,
    //   padding: 7,
    //   justifyContent: 'flex-start',
    //   alignItems: 'center',
      display: interval ? 'flex' : 'none'
    }}
    uiBackground={{
      textureMode: 'nine-slices',
      color: Color4.create(.68, .68, 1, 0.0),
      textureSlices: {
        top: 0.2,
        bottom: 0.2,
        left: 0.2,
        right: 0.2
      }
    }}
  >
      <UiEntity uiText={{ value: `Syncing`, fontSize: 40, color: Color4.White() }}></UiEntity>
      <UiEntity uiText={{ value: dots, fontSize: 40, color: Color4.White() }}></UiEntity>
  </UiEntity>
)
