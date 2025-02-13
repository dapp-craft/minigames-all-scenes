import { sceneParentEntity, ui } from "@dcl-sdk/mini-games/src";
import { engine, Entity, PBTextShape, TextAlignMode, TextShape, Transform, TransformType } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math"
import { syncEntity } from "@dcl/sdk/network";
import { readGltfLocators } from "../../../common/locators";
import { parseTime } from "../../../common/utils/time";
import { DIFFICULTY_MAPPING } from "../settings/constants";

export class Ui3D {
    private readonly counterMoves = engine.addEntity()
    private readonly counterLevel = engine.addEntity()
    private readonly counterStopwatch = engine.addEntity()
    private readonly labelDifficulty = engine.addEntity()
    private readonly buttons: ui.MenuButton[] = []
    private readonly ready
    constructor(locators: Promise<Map<String, TransformType>>, private levelButtonCallback: (arg: Number) => void) {
        const textSettings: PBTextShape = {text: '', fontSize: 3, textAlign: TextAlignMode.TAM_MIDDLE_LEFT}
        syncEntity(this.counterMoves, [TextShape.componentId], 666666+1)
        syncEntity(this.counterLevel, [TextShape.componentId], 666666+2)
        syncEntity(this.counterStopwatch, [TextShape.componentId], 666666+3)
        TextShape.create(this.counterMoves, {...textSettings})
        TextShape.create(this.counterLevel, {...textSettings})
        TextShape.create(this.counterStopwatch, {...textSettings})
        TextShape.create(this.labelDifficulty, {...textSettings, text: 'Difficulty'})
        this.ready = locators.then(this.init.bind(this))
        this.setMoves()
        this.setLevel()
        this.setTime()
    }
    private init(locators: Map<String, TransformType>) {
        for (let i = 1; i <= Object.keys(DIFFICULTY_MAPPING).length; i++) {
            const button = new ui.MenuButton(
                {...locators.get(`button_level_${i}`), parent: sceneParentEntity},
                ui.uiAssets.shapes.SQUARE_YELLOW,
                ui.uiAssets.numbers[i],
                `START LEVEL ${i}`,
                () => this.levelButtonCallback(i),
                false
            )
            // FIXME: remove .disable() call as soon as DCL fixes ctor enabledByDefault
            button.disable()
            this.buttons.push(button)
        }
        // FIXME: get rid of 'OrReplace' if DCL fixes excessive initial state sync
        Transform.createOrReplace(this.counterMoves, {...locators.get('counter_moves'), parent: sceneParentEntity})
        Transform.createOrReplace(this.counterLevel, {...locators.get('counter_level'), parent: sceneParentEntity})
        Transform.createOrReplace(this.counterStopwatch, {...locators.get('counter_stopwatch'), parent: sceneParentEntity})
        Transform.createOrReplace(this.labelDifficulty, {...locators.get('label_difficulty'), parent: sceneParentEntity})
    }
    public async setMoves(value?: number) {
        await this.ready
        this.setTextOptimized(this.counterMoves, `Moves: ${value ?? '-'}`)
    }
    public async setNoMoves() {
        await this.ready
        this.setTextOptimized(this.counterMoves, "No Moves", Color4.Red())
    }
    public async setLevel(level?: number) {
        await this.ready
        const [difficulty] = Object.entries(DIFFICULTY_MAPPING).reverse().find(([, l]) => level && level >= l) ?? []
        this.buttons.forEach((button, i) => {
            button.buttonShapeEnabled = Number(difficulty) === i + 1 ? ui.uiAssets.shapes.SQUARE_GREEN : ui.uiAssets.shapes.SQUARE_YELLOW
            if (button.enabled) button.enable()
        })
        this.setTextOptimized(this.counterLevel, `Level: ${level ?? '-'}`)
    }
    public async unlockButtons(level: number) {
        await this.ready
        const [difficulty] = Object.entries(DIFFICULTY_MAPPING).reverse().find(([, l]) => level && level >= l) ?? []
        this.buttons.forEach((button, i) => {
            if (Number(difficulty) >= i + 1) button.enable()
        })
    }
    public async lockButtons() {
        await this.ready
        this.buttons.forEach(button => button.disable())
    }
    public async setTime(value?: number) {
        await this.ready
        const {minutes, seconds, millis} = parseTime(value)
        this.setTextOptimized(this.counterStopwatch, `Time: ${minutes ?? '--'}:${seconds ?? '--'}.${millis ?? '---'}`)
    }
    private setTextOptimized(entity: Entity, value: string, color = Color4.White()) {
        if (TextShape.get(entity).text != value) {
            TextShape.getMutable(entity).text = value
            TextShape.getMutable(entity).textColor = color
        }
    }
}
