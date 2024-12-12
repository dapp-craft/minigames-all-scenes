import { westLevelsConfig } from "./config";

type LevelData = {
    stayTime: number;
    role: number[];
    generationType: string
}

type LevelsMap = Map<number, LevelData>;

export const levels: LevelsMap = new Map([
    [1, {  stayTime: 2000, role: [1, 1], generationType: 'row' }],
    [2, {  stayTime: 2000, role: [1, 1], generationType: 'gapRow' }],
    [3, {  stayTime: 2000, role: [1, 1], generationType: 'twoLevels' }],
    [4, {  stayTime: 1900, role: [1, 2], generationType: 'row' }],
    [5, {  stayTime: 1900, role: [2, 1], generationType: 'row' }],
    [6, {  stayTime: 1900, role: [1, 2], generationType: 'gapRow' }],
    [7, {  stayTime: 1800, role: [2, 1], generationType: 'gapRow' }],
    [8, {  stayTime: 1800, role: [1, 2], generationType: 'twoLevels' }],
    [9, {  stayTime: 1800, role: [2, 1], generationType: 'twoLevels' }],
    [10, {  stayTime: 1700, role: [1, 3], generationType: 'twoLevels' }],
    [11, {  stayTime: 1700, role: [2, 2], generationType: 'twoLevels' }],
    [12, {  stayTime: 1700, role: [3, 1], generationType: 'twoLevels' }],
    [13, {  stayTime: 1600, role: [1, 4], generationType: 'twoLevels' }],
    [14, {  stayTime: 1600, role: [2, 3], generationType: 'twoLevels' }],
    [15, {  stayTime: 1600, role: [3, 2], generationType: 'twoLevels' }],
])