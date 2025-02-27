import { useCallback, useMemo, useState } from 'react';
import type { ICustomUseQueryOptions, IQubicTransactionsDTO } from '../../types';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useQubicCurrentTickQuery } from './UseQubicCurrentTickQuery';
import { QubicRpcService } from '../../services/qubic-rpc';

const handleGetTransactions = async (identity: string, latestTick?: number) => {
    if (!identity) {
        throw new Error('Identity is required');
    }

    if (!latestTick) {
        throw new Error('Latest tick is required');
    }

    return QubicRpcService.getTransactions({
        identity,
        startTick: latestTick,
    });
};

const generateQueryKey = ({
    identity,
    tick,
    page,
}: {
    identity: string;
    tick?: number;
    page: number;
}) => ['qubicTransactionHistory', identity, tick ? tick.toString() : 'NO_TICK', page.toString()];

export const useQubicTransactionHistoryQuery = (
    identity: string,
    queryOptions?: Omit<ICustomUseQueryOptions<IQubicTransactionsDTO>, 'placeholderData'>,
) => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);

    const latestTickQuery = useQubicCurrentTickQuery();

    const tick = latestTickQuery?.data ?? 0;

    const queryKey = useMemo(
        () => generateQueryKey({ identity, tick, page }),
        [identity, tick, page],
    );

    const query = useQuery({
        queryKey,
        queryFn: async () => await handleGetTransactions(identity, tick),
        enabled: Boolean(identity) && Boolean(tick),
        placeholderData: keepPreviousData,
        ...queryOptions,
    });

    const refetchHandler = useCallback(() => {
        setPage((prev) => prev + 1);

        query.refetch();
    }, [query]);

    const reset = useCallback(() => {
        const currentPage = page;

        setPage(0);
        latestTickQuery.refetch();

        for (let i = 0; i < currentPage; i++) {
            queryClient.removeQueries({
                queryKey: generateQueryKey({ identity, tick, page: i }),
            });
        }
    }, [queryClient, queryKey, latestTickQuery, page]);

    return useMemo(
        () => ({
            ...query,
            refetch: refetchHandler,
            reset,
        }),
        [query],
    );
};
