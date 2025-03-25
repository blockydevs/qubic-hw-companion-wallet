import { z } from 'zod';

export const getTokensPriceFromCoingecko = async (tokenIds: string[]) => {
    const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds.join(',')}&vs_currencies=usd`,
    );
    const data = await response.json();

    const validationData = Object.fromEntries(
        tokenIds.map((id) => [id, z.object({ usd: z.number() })]),
    );

    const responseDataValidation = z.object(validationData).safeParse(data);

    if (responseDataValidation?.error?.errors?.length > 0) {
        throw new Error('Cannot fetch price data from Coingecko');
    }

    return responseDataValidation.data;
};
