import { engine } from '@dcl/sdk/ecs'
import { getConnectedPlayers } from '~system/Players'
import { getPlayer, onLeaveScene } from '@dcl/sdk/players'
import { NetworkEntity, EntityState } from '@dcl/sdk/ecs'
import { componentNumberFromName } from '@dcl/ecs/dist/components/component-number'

onLeaveScene(async address => {
    console.log("PLAYER LEFT:", address)
    const connectedPlayers = await getConnectedPlayers({})
    for (const [entity, {networkId}] of engine.getEntitiesWith(NetworkEntity)) {
        if (
            address === getPlayer()?.userId
            || connectedPlayers.players.find(({userId}) => address == userId)
            || networkId !== componentNumberFromName(address)
            || networkId == 0
            || engine.getEntityState(entity) == EntityState.Removed
        ) continue
        console.log("CLEANING PLAYER:", address)
        engine.removeEntity(entity)
    }
})
