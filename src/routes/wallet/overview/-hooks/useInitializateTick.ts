import { useEffect, useRef } from 'react';

export const useInitializeTick = ({
    latestTick,
    enabled,
    onTickInitialized,
}: {
    latestTick: number;
    onTickInitialized: (tick: number) => void;
    enabled?: boolean;
}) => {
    const isTickInitialized = useRef(false);

    useEffect(() => {
        // INITIALIZE TICK VALUE
        if (enabled && latestTick && latestTick > 0 && !isTickInitialized.current) {
            onTickInitialized(latestTick);
            isTickInitialized.current = true;
        }
    }, [enabled, latestTick, onTickInitialized]);
};
