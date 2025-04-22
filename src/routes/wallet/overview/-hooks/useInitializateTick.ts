import { useEffect, useRef } from 'react';

export const useInitializeTick = ({
    latestTick,
    transactionTickOffset,
    enabled,
}: {
    latestTick: number;
    transactionTickOffset: number;
    enabled?: boolean;
}) => {
    const isTickInitialized = useRef(false);

    const targetTransactionTick = transactionTickOffset + latestTick;

    useEffect(() => {
        // INITIALIZE TICK VALUE
        if (enabled && latestTick && latestTick > 0 && !isTickInitialized.current) {
            isTickInitialized.current = true;
        }
    }, [enabled, latestTick]);

    return { targetTransactionTick };
};
