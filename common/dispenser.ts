import {
    Entity,
    GltfContainer,
    InputAction,
    PointerEventType,
    PointerEventsResult,
    Transform,
    engine,
    pointerEventsSystem
} from '@dcl/sdk/ecs'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import * as utils from '@dcl-sdk/utils'
import * as ui from 'dcl-ui-toolkit'

type DispenserTexsts = {
    notAvailable: string
    beforeClaim: string
    afterClaim: string
}

export class Dispenser {
    private _entity: Entity

    private _claimAvailable: boolean = false

    private _texts: DispenserTexsts

    constructor(texts: DispenserTexsts) {
        this._texts = texts

        this._entity = engine.addEntity()
        Transform.create(this._entity, { parent: sceneParentEntity })
        GltfContainer.createOrReplace(this._entity, { src: 'models/obj_reward.gltf' })

        pointerEventsSystem.onPointerDown(
            {
                entity: this._entity,
                opts: {
                    button: InputAction.IA_POINTER,
                    hoverText: 'Claim'
                }
            },
            () => {
                if (!this._claimAvailable) {
                    this._exception(this._texts.notAvailable)
                    return
                }

                this._claimDialogue()
            }
        )
    }

    public enableClaim() {
        this._claimAvailable = true
    }

    public disableClaim() {
        this._claimAvailable = false
    }

    private _exception(text: string) {
        const prompt = ui.createComponent(ui.OkPrompt, {
            text: text,
            onAccept: () => {
                prompt.hide()
            },
            width: 400,
            startHidden: false
        })
        return
    }

    private _claimDialogue() {}

    private _claim() {}
}
