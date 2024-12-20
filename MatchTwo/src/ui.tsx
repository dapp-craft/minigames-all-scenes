import { ReactEcsRenderer, UiComponent } from '@dcl/sdk/react-ecs'
import { debugUi } from './game/debug_ui'
import * as ui from 'dcl-ui-toolkit'


export function setupUI() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

const uiComponent: UiComponent = () => [ui.render(), debugUi()]
