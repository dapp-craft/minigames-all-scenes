import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { UiEntity } from "@dcl/sdk/react-ecs";
import { westGameState } from "./state";

export const uiMenu = () => (
    <UiEntity
        uiTransform={{
            width: '100%',
            height: '100%',
        }}
        uiBackground={{ texture: { src: `images/decals/${westGameState.decalRandom}.png` }, color: Color4.create(1, 1, 1, westGameState.transparent) }}
    />
)