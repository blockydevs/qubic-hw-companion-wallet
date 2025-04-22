import { useEffect, useRef } from 'react';

export const useInitializeTick = ({
    latestTick,
    transactionTickOffset,
    onTickChangeHandler,
}: {
    latestTick: number;
    transactionTickOffset: number;
    onTickChangeHandler: () => void;
}) => {
    const isTickInitialized = useRef(false);

    const targetTransactionTick = transactionTickOffset + latestTick;

    useEffect(() => {
        // INITIALIZE TICK VALUE
        if (latestTick && latestTick > 0 && !isTickInitialized.current) {
            onTickChangeHandler();
            isTickInitialized.current = true;
        }
    }, [latestTick, onTickChangeHandler]);

    return { targetTransactionTick };
};
