import { useEffect, useMemo, useState } from 'react';
import type { ICustomUseInfiniteQueryOptions, IQubicTransactionsDTO } from '../../types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { QubicRpcService } from '../../services/qubic-rpc';
import { DEFAULT_TICK_INTERVAL_FOR_TRANSACTIONS } from '../../constants';

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

const handleGetTransactions = async (identity: string, startTick: number, endTick: number) => {
    if (!identity) {
        throw new Error('Identity is required');
    }

    if (!startTick) {
        throw new Error('Start tick is required');
    }

    if (!endTick) {
        throw new Error('End tick is required');
    }

    return QubicRpcService.getTransactions({ identity, startTick, endTick });
};

export const useQubicTransactionHistoryQuery = (
    {
        identity,
        initialTick,
        tickInterval = DEFAULT_TICK_INTERVAL_FOR_TRANSACTIONS,
    }: {
        initialTick: number;
        identity: string;
        tickInterval?: number;
    },
    queryOptions?: Omit<
        ICustomUseInfiniteQueryOptions<DeepPartial<IQubicTransactionsDTO>>,
        'placeholderData'
    >,
) => {
    const [endTick, setEndTick] = useState<number>(0);
    const [firstTick, setFirstTick] = useState<number>(0);

    const query = useInfiniteQuery({
        queryKey: ['qubicTransactionHistory', identity],
        queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
            const newStartTick = firstTick - tickInterval * (pageParam + 1);
            const newEndTick = firstTick - tickInterval * pageParam;

            setEndTick(newEndTick);

            return handleGetTransactions(identity, newStartTick, newEndTick);
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
