export const LEVELS = {
    1: {
        colors: {
            red: [1, 0, 0]
        },
        flasks: [
            ['red', 'red', 'red'],
            ['red']
        ] as const
    },
    2: {
        colors: {
            orange: [1, 0.5, 0],
            purple: [0.5, 0, 0.5]
        },
        flasks: [
            ['orange', 'orange'],
            ['purple', 'purple', 'purple'],
            ['orange', 'orange', 'purple']
        ] as const
    },
    3: {
        colors: {
            yellow: [1, 1, 0],
            green: [0, 1, 0]
        },
        flasks: [
            ['yellow', 'yellow'],
            ['green', 'yellow'],
            ['green', 'green'],
            ['yellow', 'green']
        ] as const
    },
    4: {
        colors: {
            yellow: [1, 1, 0],
            blue: [0, 0, 1],
            lightblue: [0, 1, 1]
        },
        flasks: [
            ['yellow', 'yellow', 'yellow', 'lightblue'],
            ['blue', 'blue', 'lightblue', 'lightblue'],
            ['blue', 'blue', 'lightblue', 'yellow'],
            [],
            []
        ] as const
    },
    5: {
        colors: {
            purple: [0.5, 0, 0.5],
            teal: [0, 0.5, 0.5],
            red: [1, 0, 0]
        },
        flasks: [
            ['teal', 'purple'],
            ['red', 'red', 'teal'],
            ['purple', 'red', 'teal'],
            ['teal', 'red'],
            ['purple', 'purple']
        ] as const
    },
    6: {
        colors: {
            orange: [1, 0.5, 0],
            blue: [0, 1, 1],
            yellow: [1, 1, 0]
        },
        flasks: [
            ['yellow', 'yellow', 'blue', 'orange'],
            ['blue', 'blue', 'yellow', 'orange'],
            ['orange', 'yellow', 'blue', 'orange'],
            [],
            []
        ] as const
    },
    7: {
        colors: {
            lightblue: [0, 1, 1],
            yellow: [1, 1, 0],
            blue: [0, 0, 1],
            orange: [1, 0.5, 0]
        },
        flasks: [
            ['blue', 'yellow', 'lightblue', 'lightblue'],
            ['blue', 'orange', 'orange', 'yellow'],
            ['blue', 'yellow', 'orange', 'lightblue'],
            ['orange', 'yellow', 'blue', 'lightblue'],
            [],
            []
        ] as const
    },
    8: {
        colors: {
            red: [1, 0, 0],
            green: [0, 1, 0],
            blue: [0, 0, 1]
        },
        flasks: [
            ['red', 'red', 'green', 'red'],
            ['red', 'blue', 'green', 'blue'],
            ['green', 'blue', 'blue', 'green'],
            []
        ] as const
    },
    9: {
        colors: {
            pink: [1, 0.4, 0.7],
            brown: [0.6, 0.3, 0],
            yellow: [1, 1, 0],
            purple: [0.5, 0, 0.5]
        },
        flasks: [
            ['yellow', 'yellow', 'brown', 'pink'],
            ['yellow', 'purple', 'brown', 'pink'],
            ['purple', 'pink', 'brown', 'purple'],
            ['pink', 'purple', 'brown', 'yellow'],
            [],
            []
        ] as const
    },
    10: {
        colors: {
            purple: [0.5, 0, 0.5],
            darkpurple: [0.3, 0, 0.3],
            blue: [0, 0.5, 1],
            green: [0, 1, 0],
            orange: [1, 0.5, 0]
        },
        flasks: [
            ['green', 'darkpurple', 'purple', 'purple'],
            ['purple', 'orange', 'blue', 'darkpurple'],
            ['blue', 'green', 'purple', 'green'],
            ['orange', 'blue', 'darkpurple', 'green'],
            ['orange', 'darkpurple', 'orange', 'blue'],
            [],
            []
        ] as const
    },
    11: {
        colors: {
            green: [0, 1, 0],
            red: [1, 0, 0],
            teal: [0, 0.5, 0.5],
            pink: [1, 0.4, 0.7],
            purple: [0.5, 0, 0.5]
        },
        flasks: [
            ['green', 'green', 'red', 'teal'],
            ['pink', 'purple', 'red', 'teal'],
            ['purple', 'red', 'pink', 'red'],
            ['pink', 'green', 'teal', 'purple'],
            ['green', 'pink', 'teal', 'purple'],
            [],
            []
        ] as const
    },
    12: {
        colors: {
            orange: [1, 0.5, 0],
            pink: [1, 0.4, 0.7],
            purple: [0.5, 0, 0.5],
            yellow: [1, 1, 0],
            teal: [0, 0.5, 0.5]
        },
        flasks: [
            ['yellow', 'orange', 'pink', 'teal'],
            ['orange', 'teal', 'yellow', 'purple'],
            ['teal', 'yellow', 'pink', 'pink'],
            ['teal', 'purple', 'orange', 'purple'],
            ['yellow', 'orange', 'purple', 'pink'],
            [],
            []
        ] as const
    },
    13: {
        colors: {
            green: [0, 1, 0],
            pink: [1, 0.4, 0.7],
            teal: [0, 0.5, 0.5],
            red: [1, 0, 0],
            purple: [0.5, 0, 0.5]
        },
        flasks: [
            ['pink', 'teal', 'pink', 'green'],
            ['pink', 'green', 'teal', 'red'],
            ['green', 'green', 'red', 'purple'],
            ['red', 'red', 'teal', 'purple'],
            ['pink', 'purple', 'teal', 'purple'],
            [],
            []
        ] as const
    },
    14: {
        colors: {
            purple: [0.5, 0, 0.5],
            pink: [1, 0.4, 0.7],
            beige: [0.96, 0.96, 0.86],
            teal: [0, 0.5, 0.5],
            yellow: [1, 1, 0]
        },
        flasks: [
            ['purple', 'purple', 'purple', 'beige'],
            ['purple', 'teal', 'yellow', 'teal'],
            ['teal', 'yellow', 'beige', 'yellow'],
            ['yellow', 'beige', 'teal', 'pink'],
            ['beige', 'pink', 'pink', 'pink'],
            [],
            []
        ] as const
    },
    15: {
        colors: {
            red: [1, 0, 0],
            pink: [1, 0.4, 0.7],
            teal: [0, 0.5, 0.5],
            beige: [0.96, 0.96, 0.86],
            purple: [0.5, 0, 0.5]
        },
        flasks: [
            ['beige', 'teal', 'pink', 'red'],
            ['beige', 'pink', 'teal', 'purple'],
            ['purple', 'pink', 'beige', 'pink'],
            ['red', 'purple', 'purple', 'red'],
            ['teal', 'red', 'teal', 'beige'],
            [],
            []
        ] as const
    },
    16: {
        colors: {
            purple: [0.5, 0, 0.5],
            green: [0, 1, 0],
            teal: [0, 0.5, 0.5],
            red: [1, 0, 0],
            pink: [1, 0.4, 0.7]
        },
        flasks: [
            ['teal', 'green', 'purple', 'purple'],
            ['pink', 'red', 'teal', 'purple'],
            ['red', 'green', 'green', 'pink'],
            ['red', 'teal', 'teal', 'green'],
            ['pink', 'red', 'purple', 'pink'],
            [],
            []
        ] as const
    },
    17: {
        colors: {
            lightblue: [0, 1, 1],
            yellow: [1, 1, 0],
            green: [0, 1, 0],
            blue: [0, 0, 1],
            orange: [1, 0.5, 0]
        },
        flasks: [
            ['orange', 'lightblue', 'yellow', 'green'],
            ['lightblue', 'orange', 'blue', 'lightblue'],
            ['orange', 'green', 'orange', 'yellow'],
            ['blue', 'green', 'lightblue', 'blue'],
            ['yellow', 'blue', 'green', 'yellow'],
            [],
            []
        ] as const
    },
    18: {
        colors: {
            red: [1, 0, 0],
            teal: [0, 0.5, 0.5],
            pink: [1, 0.4, 0.7],
            orange: [1, 0.5, 0],
            purple: [0.5, 0, 0.5]
        },
        flasks: [
            ['red', 'teal', 'pink', 'orange'],
            ['purple', 'orange', 'red', 'orange'],
            ['red', 'purple', 'pink', 'purple'],
            ['teal', 'pink', 'purple', 'teal'],
            ['red', 'teal', 'orange', 'pink'],
            [],
            []
        ] as const
    },
    19: {
        colors: {
            purple: [0.5, 0, 0.5],
            blue: [0, 1, 1],
            darkpurple: [0.3, 0, 0.3],
            brown: [0.6, 0.3, 0],
            orange: [1, 0.5, 0],
            pink: [1, 0.4, 0.7]
        },
        flasks: [
            ['purple', 'blue', 'blue', 'purple'],
            ['orange', 'orange', 'blue', 'brown'],
            ['pink', 'blue', 'purple', 'brown'],
            ['orange', 'darkpurple', 'pink', 'pink'],
            ['darkpurple', 'brown', 'pink', 'brown'],
            ['purple', 'orange', 'darkpurple', 'darkpurple'],
            [],
            []
        ] as const
    },
    20: {
        colors: {
            purple: [0.5, 0, 0.5],
            pink: [1, 0.4, 0.7],
            yellow: [1, 1, 0],
            teal: [0, 0.5, 0.5],
            blue: [0, 1, 1],
            green: [0, 0.5, 0]
        },
        flasks: [
            ['teal', 'yellow', 'pink', 'purple'],
            ['teal', 'pink', 'blue', 'pink'],
            ['yellow', 'green', 'green', 'blue'],
            ['teal', 'yellow', 'purple', 'blue'],
            ['blue', 'purple', 'green', 'green'],
            ['yellow', 'purple', 'teal', 'pink'],
            [],
            []
        ] as const
    },
    21: {
        colors: {
            yellow: [1, 1, 0],
            red: [1, 0, 0],
            purple: [0.5, 0, 0.5],
            green: [0, 0.5, 0],
            orange: [1, 0.5, 0],
            blue: [0, 0, 1]
        },
        flasks: [
            ['yellow', 'yellow', 'red', 'purple'],
            ['green', 'orange', 'orange', 'blue'],
            ['purple', 'green', 'red', 'purple'],
            ['yellow', 'green', 'orange', 'orange'],
            ['green', 'yellow', 'blue', 'red'],
            ['blue', 'red', 'blue', 'purple'],
            [],
            []
        ] as const
    },
    22: {
        colors: {
            ruby: [0.9, 0.1, 0.2],
            jade: [0.4, 0.7, 0.4],
            steel: [0.4, 0.4, 0.5],
            coral: [1, 0.5, 0.4],
            ocean: [0, 0.4, 0.7],
            brass: [0.8, 0.6, 0.2]
        },
        flasks: [
            ['ruby', 'jade', 'steel', 'coral'],
            ['ocean', 'brass', 'ocean', 'steel'],
            ['coral', 'ruby', 'brass', 'jade'],
            ['steel', 'coral', 'ruby', 'brass'],
            ['jade', 'ocean', 'brass', 'ruby'],
            ['steel', 'coral', 'jade', 'ocean'],
            [],
            []
        ] as const
    },
    23: {
        colors: {
            wine: [0.6, 0.1, 0.2],
            moss: [0.4, 0.5, 0.2],
            azure: [0.1, 0.5, 0.9],
            pearl: [0.9, 0.9, 0.8],
            mauve: [0.7, 0.5, 0.7],
            oxide: [0.5, 0.2, 0.1]
        },
        flasks: [
            ['wine', 'moss', 'azure', 'pearl'],
            ['mauve', 'oxide', 'pearl', 'moss'],
            ['azure', 'oxide', 'wine', 'mauve'],
            ['pearl', 'azure', 'oxide', 'wine'],
            ['moss', 'mauve', 'oxide', 'azure'],
            ['wine', 'pearl', 'moss', 'mauve'],
            [],
            []
        ] as const
    },
    24: {
        colors: {
            brick: [0.7, 0.2, 0.1],
            pine: [0.2, 0.5, 0.3],
            denim: [0.2, 0.3, 0.6],
            honey: [0.9, 0.7, 0.2],
            plum: [0.4, 0.2, 0.4],
            metal: [0.6, 0.6, 0.7]
        },
        flasks: [
            ['brick', 'pine', 'denim', 'honey'],
            ['plum', 'metal', 'honey', 'pine'],
            ['denim', 'brick', 'metal', 'plum'],
            ['honey', 'metal', 'brick', 'denim'],
            ['pine', 'plum', 'metal', 'brick'],
            ['denim', 'honey', 'plum', 'pine'],
            [],
            []
        ] as const
    },
    25: {
        colors: {
            garnet: [0.6, 0.1, 0.2],
            sage: [0.5, 0.6, 0.5],
            cobalt: [0.2, 0.2, 0.6],
            amber: [0.9, 0.6, 0.1],
            orchid: [0.7, 0.4, 0.7],
            bronze: [0.7, 0.5, 0.2]
        },
        flasks: [
            ['garnet', 'sage', 'cobalt', 'amber'],
            ['orchid', 'bronze', 'amber', 'cobalt'],
            ['sage', 'orchid', 'bronze', 'garnet'],
            ['amber', 'cobalt', 'orchid', 'bronze'],
            ['garnet', 'bronze', 'sage', 'orchid'],
            ['cobalt', 'amber', 'garnet', 'sage'],
            [],
            []
        ] as const
    },
    26: {
        colors: {
            crimson: [0.8, 0.1, 0.2],
            forest: [0.1, 0.3, 0.2],
            marine: [0.1, 0.3, 0.6],
            sunset: [0.9, 0.5, 0.3],
            violet: [0.5, 0.3, 0.7],
            copper: [0.7, 0.4, 0.3]
        },
        flasks: [
            ['crimson', 'forest', 'marine', 'sunset'],
            ['violet', 'copper', 'sunset', 'forest'],
            ['marine', 'violet', 'copper', 'crimson'],
            ['sunset', 'marine', 'violet', 'copper'],
            ['forest', 'crimson', 'copper', 'violet'],
            ['marine', 'sunset', 'crimson', 'forest'],
            [],
            []
        ] as const
    },
    27: {
        colors: {
            ruby: [0.9, 0.1, 0.2],
            jade: [0.4, 0.7, 0.4],
            steel: [0.4, 0.4, 0.5],
            coral: [1, 0.5, 0.4],
            ocean: [0, 0.4, 0.7],
            brass: [0.8, 0.6, 0.2]
        },
        flasks: [
            ['ruby', 'coral', 'steel', 'ocean'],
            ['jade', 'brass', 'ruby', 'coral'],
            ['steel', 'ocean', 'brass', 'jade'],
            ['coral', 'ruby', 'ocean', 'brass'],
            ['brass', 'steel', 'jade', 'ruby'],
            ['ocean', 'jade', 'steel', 'coral'],
            [],
            []
        ] as const
    },
    28: {
        colors: {
            ruby: [0.9, 0.1, 0.2],
            jade: [0.4, 0.7, 0.4],
            steel: [0.4, 0.4, 0.5],
            coral: [1, 0.5, 0.4],
            ocean: [0, 0.4, 0.7],
            brass: [0.8, 0.6, 0.2]
        },
        flasks: [
            ['ruby', 'jade', 'brass', 'coral'],
            ['steel', 'ocean', 'ruby', 'brass'],
            ['coral', 'steel', 'jade', 'ocean'],
            ['brass', 'coral', 'ocean', 'steel'],
            ['ocean', 'ruby', 'coral', 'jade'],
            ['jade', 'brass', 'steel', 'ruby'],
            [],
            []
        ] as const
    },
    29: {
        colors: {
            crimson: [0.8, 0.1, 0.2],
            emerald: [0.2, 0.8, 0.4],
            navy: [0.1, 0.2, 0.6],
            golden: [1, 0.8, 0.2],
            violet: [0.6, 0.2, 0.8],
            bronze: [0.8, 0.5, 0.2]
        },
        flasks: [
            ['crimson', 'navy', 'golden', 'violet'],
            ['emerald', 'bronze', 'navy', 'golden'],
            ['violet', 'crimson', 'bronze', 'emerald'],
            ['golden', 'violet', 'emerald', 'bronze'],
            ['navy', 'golden', 'crimson', 'violet'],
            ['bronze', 'emerald', 'navy', 'crimson'],
            [],
            []
        ] as const
    },
    30: {
        colors: {
            coral: [1, 0.3, 0.3],
            teal: [0.1, 0.7, 0.7],
            purple: [0.5, 0.1, 0.5],
            amber: [1, 0.75, 0.1],
            marine: [0.1, 0.4, 0.8],
            olive: [0.5, 0.6, 0.2]
        },
        flasks: [
            ['coral', 'marine', 'amber', 'olive'],
            ['purple', 'teal', 'marine', 'amber'],
            ['olive', 'purple', 'coral', 'teal'],
            ['marine', 'amber', 'purple', 'coral'],
            ['teal', 'olive', 'amber', 'marine'],
            ['coral', 'teal', 'olive', 'purple'],
            [],
            []
        ] as const
    }
}