export class IndexedAmplitude{
    public index: number;
    public amp: number;

    public constructor(init?:Partial<IndexedAmplitude>) {
        Object.assign(this, init);
    }
}