import type { z } from 'zod';
import type { IDataValidator } from '../types';

export class ZodValidator<Data> implements IDataValidator<Data> {
    constructor(private schema: z.Schema<Data>, private errorMessage?: string) {}

    validate(data: unknown): Data {
        const result = this.schema.safeParse(data);

        if (!result.success) {
            throw new Error(this.errorMessage ?? 'Failed to validate data.');
        }

        return result.data;
    }
}
