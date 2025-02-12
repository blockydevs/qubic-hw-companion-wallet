import { useQuery } from '@tanstack/react-query';
import { getTokensPriceFromCoingecko } from '../lib/coingecko';

export const useQubicPriceFromCoingecko = () => {
    const { data, isLoading, isFetching, isPending, isError, isLoadingError, error } = useQuery({
        queryKey: ['qubic-price-coingecko'],
        queryFn: async () => await getTokensPriceFromCoingecko(['qubic-network']),
        refetchInterval: 1000 * 180, // 3 minutes
        select: (data) => data['qubic-network']?.usd,
    });

    const hasError = isError || isLoadingError;
    const isDataLoading = isLoading || isPending || isFetching;

    if (isDataLoading) {
        return {
            isLoading: true,
            data: null,
            error: null,
        };
    }

    if (hasError) {
        return {
            isLoading: false,
            data: null,
            error,
        };
    }

    return {
        isLoading: false,
        data,
        error: null,
    };
};
