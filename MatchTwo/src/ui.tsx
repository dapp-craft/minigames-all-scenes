import { ReactEcsRenderer, UiComponent } from '@dcl/sdk/react-ecs'
import { debugUi } from './game/debug_ui'

export function setupUI() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

const uiComponent: UiComponent = () => [debugUi()]
