export function randomSample<T>(elements: Iterable<T>, count: number): T[] {
    const shuffled = Array.from(elements).sort(() => 0.5 - Math.random())
    if (count < 0) throw new Error('randomSample: negative count')
    if (count !== 0 && shuffled.length === 0) throw new Error('randomSample: array is empty')
    return count <= shuffled.length ? shuffled.slice(0, count) : shuffled.concat(randomSample(shuffled, count - shuffled.length))
}

export function randomInt(min: number, max: number) {
    if (min > max) [min, max] = [max, min]
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomChoice<T>(elements: Iterable<T>): T {
    const array = Array.from(elements)
    if (array.length === 0) throw new Error('randomChoice: array is empty')
    return array[Math.floor(Math.random() * array.length)]
}
