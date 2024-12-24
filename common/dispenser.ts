import {
    Entity,
    GltfContainer,
    InputAction,
    PointerEventType,
    PointerEventsResult,
    PointerLock,
    Transform,
    engine,
    pointerEventsSystem
} from '@dcl/sdk/ecs'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { getPlayer } from '@dcl/sdk/src/players'
import { getRealm } from '~system/Runtime'
import * as utils from '@dcl-sdk/utils'
import * as ui from 'dcl-ui-toolkit'
import { signedFetch } from '~system/SignedFetch'

type DispenserTexsts = {
    notAvailable: string
    beforeClaim: string
    afterClaim: string
}

export class Dispenser {
    private _entity: Entity

    private _claimAvailable: boolean = false
    private _rewardClaimed: boolean = false
    private _uiActive: boolean = false

    private _texts: DispenserTexsts
    private _campaignKey: string

    constructor(campaignKey: string, texts: DispenserTexsts) {
        this._campaignKey = campaignKey
        this._texts = texts

        this._entity = engine.addEntity()
        Transform.create(this._entity, { parent: sceneParentEntity })
        GltfContainer.createOrReplace(this._entity, { src: 'models/obj_reward.gltf' })

        pointerEventsSystem.onPointerDown(
            {
                entity: this._entity,
                opts: {
                    button: InputAction.IA_POINTER,
                    hoverText: 'Claim',
                    showHighlight: false
                }
            },
            () => {

                if (this._uiActive) {
                    return
                }

                if (!this._claimAvailable) {
                    this._exception(this._texts.notAvailable)
                    return
                }

                if (this._rewardClaimed) {
                    this._exception('Reward has already been claimed')
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
        this._uiActive = true
        const prompt = ui.createComponent(ui.OkPrompt, {
            text: text,
            onAccept: () => {
                prompt.hide()
                this._uiActive = false
            },
            onClose: () => {
                this._uiActive = false
            },
            acceptLabel: "   OK   ",
            width: 400,
            startHidden: false
        })
        return
    }

    private _claimDialogue() {
        this._uiActive = true
        const prompt = ui.createComponent(ui.OkPrompt, {
            text: this._texts.beforeClaim,
            onAccept: async () => {
                prompt.hide()
                this._uiActive = false
                const result = await this._claim()
                this._afterClaimDialogue(result.success, result.message)
            },
            onClose: () => {
                this._uiActive = false
            },
            width: 400,
            acceptLabel: 'Claim',
            startHidden: false
        })
    }

    private _afterClaimDialogue(status: boolean, message: string) {
        this._uiActive = true
        const prompt = ui.createComponent(ui.OkPrompt, {
            text: status ? this._texts.afterClaim : message,
            onAccept: () => {
                this._uiActive = false
                prompt.hide()
            },
            onClose: () => {
                this._uiActive = false
            },
            width: 400,
            acceptLabel: "   OK   ",
            startHidden: false
        })

    }

    private async _claim() {
        const user = getPlayer()
        const { realmInfo } = await getRealm({})

        
        
        
        if (!user || !realmInfo) {
            return { success: false, message: "Couldn't send a reward" }
        }

        if (user.isGuest) {
            return { success: false, message: 'Guests cannot claim rewards' }
        }

        //@ts-ignore
        const realmUrl = realmInfo?.baseUrl ?? realmInfo.domain
        console.log("Realm URL: ", realmUrl)
        
        const assignRequest = await signedFetch({
            url: 'https://rewards.decentraland.org/api/rewards',
            init: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    campaign_key: this._campaignKey,
                    beneficiary: user.userId,
                    catalyst: realmInfo?.baseUrl
                })
            }
        })

        if (JSON.parse(assignRequest.body).ok == true) {
            this._rewardClaimed = true
            return { success: true, message: 'Reward claimed' }
        }

        if (JSON.parse(assignRequest.body).ok == false) {
            return { success: false, message: "Rewards could not be given" }
        }

        return { success: false, message: 'Error has been occured' }
    }
}
