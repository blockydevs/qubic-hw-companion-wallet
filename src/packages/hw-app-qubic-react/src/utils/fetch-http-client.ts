import type { IHttpClient } from '../types';

export class FetchHttpClient implements IHttpClient {
    async request<Return>(url: string, requestOptions?: RequestInit): Promise<Return> {
        const method = requestOptions?.method ?? 'GET';
        const response = await fetch(url, { method, ...requestOptions });

        if (!response.ok) {
            const errorResponse = await response.json().catch(() => null);
            throw new Error(errorResponse?.message ?? `Failed "${method}" to "${url}".`);
        }

        return response.json();
    }
}
