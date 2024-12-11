type LevelData = {
    targetAmount: number;
    appearanceTime: number;
    stayTime: number;
    role: boolean[];
    generationType: string
}

type LevelsMap = Map<number, LevelData>;

export const levels: LevelsMap = new Map([
    [1, { targetAmount: 2, appearanceTime: 2000, stayTime: 2000, role: [true, false], generationType: 'row' }],
    [2, { targetAmount: 2, appearanceTime: 2000, stayTime: 2000, role: [true, false], generationType: 'gapRow' }],
    [3, { targetAmount: 2, appearanceTime: 2000, stayTime: 2000, role: [true, false], generationType: 'twoLevels' }],
    [4, { targetAmount: 3, appearanceTime: 1900, stayTime: 1900, role: [true, false, false], generationType: 'row' }],
    [5, { targetAmount: 3, appearanceTime: 1900, stayTime: 1900, role: [true, false, true], generationType: 'row' }],
    [6, { targetAmount: 3, appearanceTime: 1900, stayTime: 1900, role: [true, false, false], generationType: 'gapRow' }],
    [7, { targetAmount: 3, appearanceTime: 1800, stayTime: 1800, role: [true, false, true], generationType: 'gapRow' }],
    [8, { targetAmount: 3, appearanceTime: 1800, stayTime: 1800, role: [true, false, false], generationType: 'twoLevels' }],
    [9, { targetAmount: 3, appearanceTime: 1800, stayTime: 1800, role: [true, false, true], generationType: 'twoLevels' }],
    [10, { targetAmount: 4, appearanceTime: 1700, stayTime: 1700, role: [true, false, false, false], generationType: 'twoLevels' }],
    [11, { targetAmount: 4, appearanceTime: 1700, stayTime: 1700, role: [true, false, true, false], generationType: 'twoLevels' }],
    [12, { targetAmount: 4, appearanceTime: 1700, stayTime: 1700, role: [true, false, true, true], generationType: 'twoLevels' }],
    [13, { targetAmount: 5, appearanceTime: 1600, stayTime: 1600, role: [true, false, false, false, false], generationType: 'twoLevels' }],
    [14, { targetAmount: 5, appearanceTime: 1600, stayTime: 1600, role: [true, false, true, false, false], generationType: 'twoLevels' }],
    [15, { targetAmount: 5, appearanceTime: 1600, stayTime: 1600, role: [true, false, true, true, false], generationType: 'twoLevels' }],
])