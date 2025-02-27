import type { IDataTransformer } from '../types';

export class FunctionTransformer<Data, Return = Data> implements IDataTransformer<Data, Return> {
    constructor(private transformFn?: (data: Data) => Return) {}

    transform(data: Data): Return {
        return this.transformFn ? this.transformFn(data) : (data as unknown as Return);
    }
}
