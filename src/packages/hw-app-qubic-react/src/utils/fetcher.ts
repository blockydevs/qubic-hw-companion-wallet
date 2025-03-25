import type { z } from 'zod';
import type { IDataTransformer, IDataValidator, IHttpClient } from '../types';
import { FetchHttpClient } from './fetch-http-client';
import { FunctionTransformer } from './function-transformer';
import { ZodValidator } from './zod-validator';

export class Fetcher<Data, Return = Data> {
    private constructor(
        private httpClient: IHttpClient,
        private validator: IDataValidator<Data>,
        private transformer: IDataTransformer<Data, Return>,
    ) {}

    async fetch(url: string, requestOptions?: RequestInit): Promise<Return> {
        const responseData = await this.httpClient.request<unknown>(url, requestOptions);
        const validatedData = this.validator.validate(responseData);

        return this.transformer.transform(validatedData);
    }

    static create<Data, Return = Data>({
        schema,
        errorMessage,
        transformResponse,
    }: {
        schema: z.Schema<Data>;
        errorMessage?: string;
        transformResponse?: (data: Data) => Return;
    }): Fetcher<Data, Return> {
        return new Fetcher<Data, Return>(
            new FetchHttpClient(),
            new ZodValidator(schema, errorMessage),
            new FunctionTransformer(transformResponse),
        );
    }
}
