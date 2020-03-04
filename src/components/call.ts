export class SingleCall<TResult> {
  /* tslint:disable:variable-name */
  private _lastCallId: number = 0;
  private _func: (...params: any[]) => Promise<TResult>;
  /* tslint:enable:variable-name */
  public constructor(func: (...params: any[]) => Promise<TResult>) {
    this._func = func;
  }

  public async invoke(...params: any[]): Promise<TResult> {
    const lastCallId = this._lastCallId += 1;
    const result = await this._func(...params);
    return lastCallId === this._lastCallId ? result : undefined;
  }
}
