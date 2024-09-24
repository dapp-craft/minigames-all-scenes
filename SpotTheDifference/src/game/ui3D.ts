import { sceneParentEntity, ui } from "@dcl-sdk/mini-games/src";
import { engine, Entity, Font, PBTextShape, TextAlignMode, TextShape, Transform, TransformType } from "@dcl/sdk/ecs";
import { readGltfLocators } from "../../../common/locators";

export class Ui3D {
    private readonly counterObjects = engine.addEntity()
    private readonly counterLevel = engine.addEntity()
    private readonly counterStopwatch = engine.addEntity()
    private readonly ready
    constructor(private levelButtonCallback: (arg: Number) => void) {
        this.ready = readGltfLocators(`locators/obj_locators_unique.gltf`).then(this.init.bind(this))
        this.setObjects()
        this.setLevel()
        this.setTime()
    }
    private init(locators: Map<String, TransformType>) {
        for (let i = 1; i < 7; i++) new ui.MenuButton(
            {...locators.get(`button_level_${i}`)!, parent: sceneParentEntity},
            ui.uiAssets.shapes.SQUARE_YELLOW,
            ui.uiAssets.numbers[i],
            `START LEVEL ${i}`,
            () => this.levelButtonCallback(i)
        )
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
        this.setTextOptimized(this.counterLevel, `Level: ${level ?? '-'}`)
    }
    public async setTime(value?: number) {
        await this.ready
        const minutes = value ? String(Math.floor(value / 60)).padStart(2, '0') : undefined
        const seconds = value ? String(Math.floor(value % 60)).padStart(2, '0') : undefined
        this.setTextOptimized(this.counterStopwatch, `Round: ${minutes ?? '--'}:${seconds ?? '--'}`)
    }
    private setTextOptimized(entity: Entity, value: string) {
        if (TextShape.get(entity).text != value) TextShape.getMutable(entity).text = value
    }
}
