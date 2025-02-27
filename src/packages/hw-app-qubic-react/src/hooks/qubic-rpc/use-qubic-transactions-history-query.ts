import { useEffect, useMemo, useState } from 'react';
import type { ICustomUseInfiniteQueryOptions, IQubicTransactionsDTO } from '../../types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { DEFAULT_TICK_INTERVAL_FOR_TRANSACTIONS } from '../../constants';
import { useQubicRpcService } from './use-qubic-rpc-service';

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

interface UseQubicTransactionsHistoryQueryProps {
    initialTick: number;
    identity: string;
    tickInterval?: number;
}

export const useQubicTransactionHistoryQuery = (
    {
        identity,
        initialTick,
        tickInterval = DEFAULT_TICK_INTERVAL_FOR_TRANSACTIONS,
    }: UseQubicTransactionsHistoryQueryProps,
    queryOptions?: ICustomUseInfiniteQueryOptions<DeepPartial<IQubicTransactionsDTO>>,
) => {
    const qubicRpcService = useQubicRpcService();
    const [endTick, setEndTick] = useState<number>(0);
    const [firstTick, setFirstTick] = useState<number>(0);

    const query = useInfiniteQuery({
        queryKey: ['qubicTransactionHistory', identity],
        queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
            const newStartTick = firstTick - tickInterval * (pageParam + 1);
            const newEndTick = firstTick - tickInterval * pageParam;

            setEndTick(newEndTick);

            return qubicRpcService.getTransactions({
                identity,
                startTick: newStartTick,
                endTick: newEndTick,
            });
        },
        initialPageParam: 0,
        getNextPageParam: (_, allPages) =>
            endTick - tickInterval < 0 ? undefined : allPages.length,
        enabled: Boolean(identity) && Boolean(firstTick),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        ...queryOptions,
    });

    useEffect(() => {
        if (!firstTick && initialTick > 0) {
            setFirstTick(initialTick);
        }
    }, [firstTick, initialTick]);

    return useMemo(
        () => ({
            ...query,
            endTick,
            firstTick,
        }),
        [query],
    );
};
