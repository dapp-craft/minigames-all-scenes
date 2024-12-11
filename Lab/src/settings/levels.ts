
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
            orange: [1, 0.5, 0],  // RGB для оранжевого
            purple: [0.5, 0, 0.5]  // RGB для фиолетового
        },
        flasks: [
            ['orange', 'orange'],               // первая пробирка
            ['purple', 'purple', 'purple'],     // вторая пробирка
            ['orange', 'orange', 'purple']      // третья пробирка
        ] as const
    },
    3: {
        colors: {
            yellow: [1, 1, 0],     // RGB для желтого
            green: [0, 1, 0]       // RGB для зеленого
        },
        flasks: [
            ['yellow', 'yellow'],          // первая пробирка
            ['green', 'yellow'], // вторая пробирка 
            ['green', 'green'],  // третья пробирка
            ['yellow', 'green'],          // четвертая пробирка
        ] as const
    },
    4: {
        colors: {
            yellow: [1, 1, 0],     // RGB для желтого
            blue: [0, 0, 1],       // RGB для темно-синего
            lightblue: [0, 1, 1]   // RGB для светло-синего
        },
        flasks: [
            ['yellow', 'yellow','yellow', 'lightblue'],          // первая пробирка
            ['blue', 'blue', 'lightblue', 'lightblue'],              // вторая пробирка 
            ['blue', 'blue', 'lightblue', 'yellow'],    // третья пробирка
            [],                                         // четвертая пробирка (пустая)
            []                                          // пятая пробирка (пустая)
        ] as const
    },
    5: {
        colors: {
            purple: [0.5, 0, 0.5],     // RGB для фиолетового
            teal: [0, 0.5, 0.5],       // RGB для бирюзового
            red: [1, 0, 0]             // RGB для красного
        },
        flasks: [
            ['teal', 'purple'],          // первая пробирка
            ['red', 'red', 'teal'],             // вторая пробирка
            ['purple', 'red', 'teal'],           // третья пробирка
            ['teal', 'red'],             // четвертая пробирка
            ['purple', 'purple'],                  // пятая пробирка
        ] as const
    },
    6: {
        colors: {
            orange: [1, 0.5, 0],    // RGB для оранжевого
            blue: [0, 1, 1],        // RGB для голубого
            yellow: [1, 1, 0]       // RGB для желтого
        },
        flasks: [
            ['yellow', 'yellow', 'blue', 'orange'],         // первая пробирка
            ['blue', 'blue', 'yellow', 'orange'],          // вторая пробирка
            ['orange', 'yellow', 'blue', 'orange'],        // третья пробирка
            [],                                            // четвертая пробирка (пустая)
            []                                             // пятая пробирка (пустая)
        ] as const
    },
    7: {
        colors: {
            lightblue: [0, 1, 1],   // RGB для светло-голубого
            yellow: [1, 1, 0],       // RGB для желтого
            blue: [0, 0, 1],         // RGB для синего
            orange: [1, 0.5, 0]      // RGB для оранжевого
        },
        flasks: [
            ['lightblue', 'yellow', 'yellow', 'lightblue'],              // первая пробирка
            ['blue', 'orange', 'orange', 'blue'],         // вторая пробирка
            ['blue', 'yellow', 'orange', 'lightblue'],    // третья пробирка
            ['orange', 'yellow', 'blue', 'lightblue'],    // четвертая пробирка
            [],                                           // пятая пробирка (пустая)
            []                                            // шестая пробирка (пустая)
        ] as const
    },
    8: {
        colors: {
            pink: [1, 0.4, 0.7],     // RGB для розового
            brown: [0.6, 0.3, 0],     // RGB для коричневого
            yellow: [1, 1, 0],        // RGB для желтого
            purple: [0.5, 0, 0.5]     // RGB для фиолетового
        },
        flasks: [
            ['yellow', 'yellow', 'brown', 'pink'],          // первая пробирка
            ['yellow', 'purple', 'brown', 'pink'], // вторая пробирка
            ['purple', 'pink', 'brown', 'purple'], // третья пробирка
            ['pink', 'purple', 'brown', 'yellow'], // четвертая пробирка
            [],                                    // пятая пробирка (пустая)
            []                                     // шестая пробирка (пустая)
        ] as const
    },
    9: {
        colors: {
            purple: [0.5, 0, 0.5],     // RGB для фиолетового
            darkpurple: [0.3, 0, 0.3], // RGB для темно-фиолетового
            blue: [0, 0.5, 1],         // RGB для синего
            green: [0, 1, 0],          // RGB для зеленого
            orange: [1, 0.5, 0]        // RGB для оранжевого
        },
        flasks: [
            ['green', 'darkpurple', 'purple', 'purple'],          // первая пробирка
            ['purple', 'orange', 'blue', 'darkpurple'],         // вторая пробирка
            ['blue', 'green', 'purple', 'green'],       // третья пробирка
            ['orange', 'blue', 'darkpurple', 'green'],      // четвертая пробирка
            ['orange', 'darkpurple', 'orange', 'blue'],     // пятая пробирка
            [],                                         // шестая пробирка (пустая)
            []                                          // седьмая пробирка (пустая)
        ] as const
    },
    10: {
        colors: {
            green: [0, 1, 0],         // RGB для зеленого
            red: [1, 0, 0],           // RGB для красного
            teal: [0, 0.5, 0.5],      // RGB для бирюзового
            pink: [1, 0.4, 0.7],      // RGB для розового
            purple: [0.5, 0, 0.5]     // RGB для фиолетового
        },
        flasks: [
            ['green', 'green', 'red', 'teal'],            // первая пробирка
            ['pink', 'purple', 'red', 'teal'],          // вторая пробирка
            ['purple', 'red', 'pink', 'red'],           // третья пробирка
            ['pink', 'green', 'teal', 'purple'],         // четвертая пробирка
            ['green', 'pink', 'teal', 'purple'],           // пятая пробирка
            [],                                  // шестая пробирка (пустая)
            []                                   // седьмая пробирка (пустая)
        ] as const
    },
    11: {
        colors: {
            orange: [1, 0.5, 0],       // RGB для оранжевого
            pink: [1, 0.4, 0.7],       // RGB для розового
            purple: [0.5, 0, 0.5],     // RGB для фиолетового
            yellow: [1, 1, 0],         // RGB для желтого
            teal: [0, 0.5, 0.5]        // RGB для бирюзового
        },
        flasks: [
            ['yellow', 'orange', 'pink', 'teal'],           // первая пробирка
            ['orange', 'teal', 'yellow', 'purple'], // вторая пробирка
            ['teal', 'yellow', 'pink', 'pink'],           // третья пробирка
            ['teal', 'purple', 'orange', 'purple'],         // четвертая пробирка
            ['yellow', 'orange', 'purple', 'pink'], // пятая пробирка
            [],                                    // шестая пробирка (пустая)
            []                                     // седьмая пробирка (пустая)
        ] as const
    },
    12: {
        colors: {
            green: [0, 1, 0],         // RGB для зеленого
            pink: [1, 0.4, 0.7],      // RGB для розового
            teal: [0, 0.5, 0.5],      // RGB для бирюзового
            red: [1, 0, 0],           // RGB для красного
            purple: [0.5, 0, 0.5]     // RGB для фиолетового
        },
        flasks: [
            ['pink', 'teal', 'pink', 'green'],          // первая пробирка
            ['pink', 'green', 'teal', 'red'],           // вторая пробирка
            ['green', 'green', 'red', 'purple'],         // третья пробирка
            ['red', 'red', 'teal', 'purple'],          // четвертая пробирка
            ['pink', 'purple', 'teal', 'purple'],         // пятая пробирка
            [],                                 // шестая пробирка (пустая)
            []                                  // седьмая пробирка (пустая)
        ] as const
    },
    13: {
        colors: {
            purple: [0.5, 0, 0.5],     // RGB для фиолетового
            pink: [1, 0.4, 0.7],       // RGB для розового
            beige: [0.96, 0.96, 0.86], // RGB для бежевого
            teal: [0, 0.5, 0.5],       // RGB для бирюзового
            yellow: [1, 1, 0]          // RGB для желтого
        },
        flasks: [
            ['purple', 'purple', 'purple', 'beige'],              // первая пробирка
            ['purple', 'teal', 'yellow', 'teal'],     // вторая пробирка
            ['teal', 'yellow', 'beige', 'yellow'],      // третья пробирка
            ['yellow', 'beige', 'teal', 'pink'], // четвертая пробирка
            ['beige', 'pink', 'pink', 'pink'],                // пятая пробирка
            [],                               // шестая пробирка (пустая)
            []                                // седьмая пробирка (пустая)
        ] as const
    },
    14: {
        colors: {
            red: [1, 0, 0],           // RGB для красного
            pink: [1, 0.4, 0.7],      // RGB для розового
            teal: [0, 0.5, 0.5],      // RGB для бирюзового
            beige: [0.96, 0.96, 0.86], // RGB для бежевого
            purple: [0.5, 0, 0.5]      // RGB для фиолетового
        },
        flasks: [
            ['beige', 'teal', 'pink', 'red'],       // первая пробирка
            ['beige', 'pink', 'teal', 'purple'],             // вторая пробирка
            ['purple', 'pink', 'beige', 'pink'],            // третья пробирка
            ['red', 'purple', 'purple', 'red'],               // четвертая пробирка
            ['teal', 'red', 'teal', 'beige'],               // пятая пробирка
            [],                                      // шестая пробирка (пустая)
            []                                       // седьмая пробирка (пустая)
        ] as const
    },
    15: {
        colors: {
            purple: [0.5, 0, 0.5],     // RGB для фиолетового
            green: [0, 1, 0],          // RGB для зеленого
            teal: [0, 0.5, 0.5],       // RGB для бирюзового
            red: [1, 0, 0],            // RGB для красного
            pink: [1, 0.4, 0.7]        // RGB для розового
        },
        flasks: [
            ['teal', 'green', 'purple', 'purple'],          // первая пробирка
            ['pink', 'red', 'teal', 'purple'],            // вторая пробирка
            ['red', 'green', 'green', 'pink'],             // третья пробирка
            ['red', 'teal', 'teal', 'green'],             // четвертая пробирка
            ['pink', 'red', 'purple', 'pink'],            // пятая пробирка
            [],                                   // шестая пробирка (пустая)
            []                                    // седьмая пробирка (пустая)
        ] as const
    },
    16: {
        colors: {
            lightblue: [0, 1, 1],    // RGB для светло-голубого
            yellow: [1, 1, 0],        // RGB для желтого
            green: [0, 1, 0],         // RGB для зеленого
            blue: [0, 0, 1],          // RGB для синего
            orange: [1, 0.5, 0]       // RGB для оранжевого
        },
        flasks: [
            ['orange', 'lightblue', 'yellow', 'green'],             // первая пробирка
            ['lightblue', 'orange', 'blue', 'lightblue',],              // вторая пробирка
            ['orange', 'green', 'orange', 'yellow'],   // третья пробирка
            ['blue', 'green', 'lightblue', 'blue'],                // четвертая пробирка
            ['yellow', 'blue', 'green', 'yellow'],        // пятая пробирка
            [],                                           // шестая пробирка (пустая)
            []                                            // седьмая пробирка (пустая)
        ] as const
    },
    17: {
        colors: {
            red: [1, 0, 0],          // RGB для красного 
            teal: [0, 0.5, 0.5],     // RGB для бирюзового
            pink: [1, 0.4, 0.7],     // RGB для розового
            orange: [1, 0.5, 0],     // RGB для оранжевого
            purple: [0.5, 0, 0.5]    // RGB для фиолетового
            
        },
        flasks: [
            ['red', 'teal', 'pink', 'orange'],      // первая пробирка
            ['purple', 'orange', 'red', 'orange'],            // вторая пробирка
            ['red', 'purple', 'pink', 'purple'],              // третья пробирка
            ['teal', 'pink', 'purple', 'teal'],             // четвертая пробирка
            ['red', 'teal', 'orange', 'pink'],      // пятая пробирка
            [],                                     // шестая пробирка (пустая)
            []                                      // седьмая пробирка (пустая)
        ] as const
    },
    18: {
        colors: {
            purple: [0.5, 0, 0.5],     // RGB для фиолетового
            blue: [0, 1, 1],           // RGB для голубого
            darkpurple: [0.3, 0, 0.3], // RGB для темно-фиолетового
            brown: [0.6, 0.3, 0],      // RGB для коричневого
            orange: [1, 0.5, 0],       // RGB для оранжевого
            pink: [1, 0.4, 0.7]        // RGB для розового
        },
        flasks: [
            ['purple', 'blue', 'blue', 'purple'],               // первая пробирка
            ['orange', 'orange', 'blue', 'brown'],              // вторая пробирка
            ['pink', 'blue', 'purple', 'brown'],      // третья пробирка
            ['orange', 'darkpurple', 'pink', 'pink'],             // четвертая пробирка
            ['darkpurple','brown', 'pink', 'brown'],     // пятая пробирка
            ['purple', 'orange', 'darkpurple', 'darkpurple'],                     // шестая пробирка
            [],                                       // седьмая пробирка (пустая)
            []                                        // восьмая пробирка (пустая)
        ] as const
    },
    19: {
        colors: {
            purple: [0.5, 0, 0.5],     // RGB для фиолетового
            pink: [1, 0.4, 0.7],       // RGB для розового
            yellow: [1, 1, 0],         // RGB для желтого
            teal: [0, 0.5, 0.5],       // RGB для бирюзового
            blue: [0, 1, 1],           // RGB для голубого
            green: [0, 0.5, 0]         // RGB для зеленого
        },
        flasks: [
            ['teal', 'yellow', 'pink', 'purple'],    // первая пробирка
            ['teal', 'pink', 'blue', 'pink'],        // вторая пробирка
            ['yellow', 'green', 'green', 'blue'],             // третья пробирка
            ['teal', 'yellow', 'purple', 'blue'],    // четвертая пробирка
            ['blue', 'purple', 'green', 'green'],             // пятая пробирка
            ['yellow', 'purple', 'teal', 'pink'],    // шестая пробирка
            [],                                      // седьмая пробирка (пустая)
            []                                       // восьмая пробирка (пустая)
        ] as const
    },
    20: {
        colors: {
            yellow: [1, 1, 0],        // RGB для желтого
            red: [1, 0, 0],           // RGB для красного
            purple: [0.5, 0, 0.5],    // RGB для фиолетового
            green: [0, 0.5, 0],       // RGB для зеленого
            orange: [1, 0.5, 0],      // RGB для оранжевого
            blue: [0, 0, 1]           // RGB для синего
        },
        flasks: [
            ['yellow', 'yellow', 'red', 'purple'],            // первая пробирка
            ['green', 'orange', 'orange', 'blue'],            // вторая пробирка
            ['purple', 'green', 'red', 'purple'],   // третья пробирка
            ['yellow', 'green', 'orange', 'orange'],          // четвертая пробирка
            ['green', 'yellow', 'blue', 'red'],     // пятая пробирка
            ['blue', 'red', 'blue', 'purple'],              // шестая пробирка
            [],                                     // седьмая пробирка (пустая)
            []                                      // восьмая пробирка (пустая)
        ] as const
    }
}
