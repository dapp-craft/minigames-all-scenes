import { sceneParentEntity, ui } from "@dcl-sdk/mini-games/src";
import { engine, Entity, PBTextShape, TextAlignMode, TextShape, Transform, TransformType } from "@dcl/sdk/ecs";
import { readGltfLocators } from "../../../common/locators";
import { parseTime } from "../../../common/utils/time";

export class Ui3D {
    private readonly counterObjects = engine.addEntity()
    private readonly counterLevel = engine.addEntity()
    private readonly counterStopwatch = engine.addEntity()
    private readonly buttons: ui.MenuButton[] = []
    private readonly ready
    constructor(private levelButtonCallback: (arg: Number) => void) {
        this.ready = readGltfLocators(`locators/obj_locators_unique.gltf`).then(this.init.bind(this))
        this.setObjects()
        this.setLevel()
        this.setTime()
    }
    private init(locators: Map<String, TransformType>) {
        for (let i = 1; i < 7; i++) this.buttons.push(new ui.MenuButton(
            {...locators.get(`button_level_${i}`)!, parent: sceneParentEntity},
            ui.uiAssets.shapes.SQUARE_YELLOW,
            ui.uiAssets.numbers[i],
            `START LEVEL ${i}`,
            () => this.levelButtonCallback(i)
        ))
        const textSettings: PBTextShape = {text: '', fontSize: 3, textAlign: TextAlignMode.TAM_MIDDLE_LEFT}
        Transform.create(this.counterObjects, {...locators.get('counter_foundObjects'), parent: sceneParentEntity})
        TextShape.create(this.counterObjects, {...textSettings})
        Transform.create(this.counterLevel, {...locators.get('counter_level'), parent: sceneParentEntity})
        TextShape.create(this.counterLevel, {...textSettings})
        Transform.create(this.counterStopwatch, {...locators.get('counter_stopwatch'), parent: sceneParentEntity})
        TextShape.create(this.counterStopwatch, {...textSettings})
    }
    public async setObjects(current?: number, total?: number) {
        await this.ready
        this.setTextOptimized(this.counterObjects, `Found: ${current ?? '-'} / ${total ?? '-'}`)
    }
    public async setLevel(level?: number) {
        await this.ready
        this.buttons.forEach((button, i) => {
            button.buttonShapeEnabled = level === i + 1 ? ui.uiAssets.shapes.SQUARE_GREEN : ui.uiAssets.shapes.SQUARE_YELLOW
            if (button.enabled) button.enable()
        })
        this.setTextOptimized(this.counterLevel, `Level: ${level ?? '-'}`)
    }
    public async setTime(value?: number) {
        await this.ready
        const {minutes, seconds, millis} = parseTime(value)
        this.setTextOptimized(this.counterStopwatch, `Time: ${minutes ?? '--'}:${seconds ?? '--'}.${millis ?? '---'}`)
    }
    private setTextOptimized(entity: Entity, value: string) {
        if (TextShape.get(entity).text != value) TextShape.getMutable(entity).text = value
    }
}
