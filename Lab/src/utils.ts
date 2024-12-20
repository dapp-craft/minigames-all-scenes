export class FlowController<T> {
    static readonly InterruptType = class<T> {
        value: T|undefined|null = undefined
    }
    private reject!: Function
    private data = new FlowController.InterruptType<T>()

    readonly interrupted = new Promise<never>((_, r) => this.reject = r)
    public goto(arg: T) {
        this.data.value = this.data.value !== null ? arg : null
        this.reject(this.data)
    }
    public break() {
        this.data.value = null
        this.reject(this.data)
    }
}
