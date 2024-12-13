export class FlowController<T> {
    private reject!: Function
    private data = {value: <T|undefined|null> undefined}

    readonly interrupted = new Promise<never>((_, r) => this.reject = r)
    public goto(arg: T) {
        this.data.value = this.data.value === undefined ? arg : null
        this.reject(this.data)
    }
    public break() {
        this.data.value = null
        this.reject(this.data)
    }
}
