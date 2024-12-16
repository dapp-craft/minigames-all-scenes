import { westLevelsConfig } from "./config";

type LevelData = {
    role: number[];
    generationType: string
}

type LevelsMap = Map<number, LevelData>;

export let levels: LevelsMap = new Map([
    [1, { role: [1, 1], generationType: 'row' }],
    [2, { role: [1, 1], generationType: 'gapRow' }],
    [3, { role: [1, 1], generationType: 'twoLevels' }],
    [4, { role: [1, 2], generationType: 'row' }],
    [5, { role: [2, 1], generationType: 'row' }],
    [6, { role: [1, 2], generationType: 'gapRow' }],
    [7, { role: [2, 1], generationType: 'gapRow' }],
    [8, { role: [1, 2], generationType: 'twoLevels' }],
    [9, { role: [2, 1], generationType: 'twoLevels' }],
    [10, { role: [1, 3], generationType: 'twoLevels' }],
    [11, { role: [2, 2], generationType: 'twoLevels' }],
    [12, { role: [3, 1], generationType: 'twoLevels' }],
    [13, { role: [1, 4], generationType: 'twoLevels' }],
    [14, { role: [2, 3], generationType: 'twoLevels' }],
    [15, { role: [3, 2], generationType: 'twoLevels' }],
])