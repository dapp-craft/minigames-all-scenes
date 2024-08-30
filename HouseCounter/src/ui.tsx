import { ReactEcsRenderer, UiComponent } from '@dcl/sdk/react-ecs'

export function setupUI() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

const uiComponent: UiComponent = () => []
