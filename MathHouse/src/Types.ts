export type Cartridge = {
    itemQueue: Array<string>
    goOut: boolean
}

export type CartridgeTest = {
    itemQueue: number
    goOut: boolean
}

export type SpawnEntityDelay = {
    time: number;
    random?: boolean;
};