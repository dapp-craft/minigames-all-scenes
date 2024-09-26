enum UNITS {
    hours = 'hours',
    minutes = 'minutes',
    seconds = 'seconds',
    millis = 'millis',
}
const MULT = {
    [UNITS.millis]: 1/1000,
    [UNITS.seconds]: 1,
    [UNITS.minutes]: 60,
    [UNITS.hours]: 3600
}

export function parseTime(value?: number, unit: UNITS = UNITS.seconds) : {[k in UNITS]: string | undefined} {
    return Object.fromEntries(Object.values(UNITS).map((k, i, a) => [k, value !== undefined
        ? String(Math.floor(value * MULT[unit] % (MULT[a[i-1]] ?? Number.POSITIVE_INFINITY) / MULT[a[i]]))
            .padStart(k == UNITS.millis ? 3 : 2, '0')
        : undefined
    ])) as ReturnType<typeof parseTime>
}
