import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { Button, Input, Label, UiEntity } from "@dcl/sdk/react-ecs";

export const cooldown = {value: 0}
export const ui = () =>
<UiEntity
    uiTransform={{
        height: 100,
        width: 100,
        position: {top: '50%', left: '50%'},
        margin: {top: -50, left: -50},
        alignItems: 'center',
        display: cooldown.value ? 'flex' : 'none'
    }}
    uiBackground={{
        texture: { src: 'images/stop.png' },
        textureMode: "stretch"
    }}
>
    <Label
        value={`${cooldown.value.toFixed(0)}`}
        fontSize={25}
        color={Color4.Black()}
        textAlign="middle-center"
        uiTransform={{width: "100%", height: 25, position: {bottom: -25, left: 2}}}
        // uiBackground={{color: Color4.Blue()}}
    />
</UiEntity>
