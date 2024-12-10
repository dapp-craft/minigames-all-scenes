type LevelData = {
    speed: number;
    floor: number;
    targetAmount: number;
    appearanceTime: number;
    stayTime: number;
    role: Boolean[]
}

type LevelsMap = Map<number, LevelData>;

export const levels: LevelsMap = new Map([
    [1, { speed: 1000, floor: 1, targetAmount: 2, appearanceTime: 500, stayTime: 5000, role: [true, false] }],
    [2, { speed: 1000, floor: 1, targetAmount: 3, appearanceTime: 500, stayTime: 5000, role: [true, false, true] }]
])