import { z } from 'zod';

export interface IFetcherArgs<Data, Return = Data> {
    url: string;
    requestOptions?: RequestInit;
    validation: {
        schema: z.Schema<Data>;
        errorMessage?: string;
    };
    transformResponse?: (data: Data) => Return;
}

export const fetcher = async <Data, Return = Data>({
    requestOptions,
    url,
    validation,
    transformResponse,
}: IFetcherArgs<Data, Return>): Promise<Return> => {
    const method = requestOptions?.method ?? 'GET';

    const response = await fetch(url, { method, ...requestOptions });

    if (!response.ok) {
        throw new Error(`Failed "${method}" to "${url}".}`);
    }

    const responseData = await response.json();
    const validatedResponseData = validation.schema.safeParse(responseData);

    if (!validatedResponseData.success) {
        throw new Error(validation.errorMessage ?? 'Failed to validate data.');
    }

    return transformResponse
        ? transformResponse(validatedResponseData.data)
        : (validatedResponseData.data as unknown as Return);
};
