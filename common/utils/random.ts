export function randomSample<T>(arr: Iterable<T>, n: number): T[] {
    const shuffled = Array.from(arr).sort(() => 0.5 - Math.random())
    if (n !== 0 && shuffled.length === 0) throw new Error('randomSample: array is empty')
    return n <= shuffled.length ? shuffled.slice(0, n) : shuffled.concat(randomSample(shuffled, n - shuffled.length))
}

export function randomInt(min: number, max: number) {
    if (min > max) [min, max] = [max, min]
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomChoice<T>(iterable: Iterable<T>): T {
    const array = Array.from(iterable)
    if (array.length === 0) throw new Error('randomChoice: array is empty')
    return array[Math.floor(Math.random() * array.length)]
}
