import { CreateStateSynchronizer } from "../../../../common/synchronizer"
import { Board } from "../Board"
import { BoardDescriptorSchema } from "./components"

const _syncState = CreateStateSynchronizer('boardState', BoardDescriptorSchema, {
    update: async (state) => {
        const board = Board.getInstance()
        console.log("Received state", state)
        if (board) {
            if (board.synchronization == "RECEIVER") {
                board.applyState(state)
            }
        }
    }
})
export let STATE_SYNCHRONIZER: InstanceType<typeof _syncState>

export function initSynhonizer(){
    STATE_SYNCHRONIZER = new _syncState()
    STATE_SYNCHRONIZER.start()

    const BOARD = Board.getInstance()
    BOARD.subscribe("ENTITY_MOVED", (event) => {
        if (BOARD.synchronization != "SENDER") return
        STATE_SYNCHRONIZER.send(BOARD.getState())
    })
    BOARD.subscribe("CELL_CHANGED", (event) => {
        if (BOARD.synchronization != "SENDER") return
        STATE_SYNCHRONIZER.send(BOARD.getState())
    })
    BOARD.subscribe("ENTITY_ADDED", (event) => {
        if (BOARD.synchronization != "SENDER") return
        STATE_SYNCHRONIZER.send(BOARD.getState())
    })
    BOARD.subscribe("ENTITY_REMOVED", (event) => {
        if (BOARD.synchronization != "SENDER") return
        STATE_SYNCHRONIZER.send(BOARD.getState())
    })
    BOARD.subscribe("BOARD_RESIZED", (event) => {
        if (BOARD.synchronization != "SENDER") return
            STATE_SYNCHRONIZER.send(BOARD.getState())
    })
}

