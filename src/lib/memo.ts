export class Memo<IN, OUT> {
  private keyFn;
  private calculateFn;
  private memos: Record<string, OUT>;

  constructor(keyFn: (input: IN) => string, calculateFn: (input: IN) => OUT) {
    this.keyFn = keyFn;
    this.calculateFn = calculateFn;
    this.memos = {};
  }

  public get(input: IN): OUT {
    const key = this.keyFn(input);
    if (!Object.hasOwn(this.memos, key)) {
      this.memos[key] = this.calculateFn(input);
    }
    return this.memos[key];
  }
}
