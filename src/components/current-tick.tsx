import { useQubicCurrentTickQuery } from '@/packages/hw-app-qubic-react';
import type { PolymorphicComponentProps, TextProps } from '@mantine/core';
import { Text } from '@mantine/core';
import React, { useLayoutEffect, useRef, useState } from 'react';

export const CurrentTick = (props: PolymorphicComponentProps<'p', TextProps>) => {
    const [isTickAnimationEnabled, setIsTickAnimationEnabled] = useState(false);
    const [secondPassedFromLastTickUpdate, setSecondPassedFromLastTickUpdate] = useState(0);
    const {
        data: latestTick,
        isLoading: isLoadingLatestTick,
        isPending: isPendingLatestTick,
        isFetching: isFetchingLatestTick,
        isRefetching: isRefetchingLatestTick,
    } = useQubicCurrentTickQuery();

    const displayedTick = useRef(latestTick);

    useLayoutEffect(() => {
        if (
            latestTick &&
            !isLoadingLatestTick &&
            !isPendingLatestTick &&
            !isFetchingLatestTick &&
            !isRefetchingLatestTick
        ) {
            const timer = setInterval(() => {
                setSecondPassedFromLastTickUpdate((prev) => prev + 1);
            }, 1000);

            return () => clearInterval(timer);
        }

        return () => {
            setSecondPassedFromLastTickUpdate(0);
        };
    }, [
        isFetchingLatestTick,
        isLoadingLatestTick,
        isPendingLatestTick,
        isRefetchingLatestTick,
        latestTick,
    ]);

    useLayoutEffect(() => {
        if (latestTick !== displayedTick.current) {
            setIsTickAnimationEnabled(true);
            displayedTick.current = latestTick;

            const timer = setTimeout(() => {
                setIsTickAnimationEnabled(false);
            }, 1000);

            return () => clearTimeout(timer);
        }

        return () => setIsTickAnimationEnabled(false);
    }, [latestTick]);

    return (
        <Text miw={{ sm: '160px' }} ta='end' {...props}>
            Tick:{' '}
            <Text
                fw={isTickAnimationEnabled ? 900 : 400}
                style={{ transition: 'font-weight 200ms' }}
                component='span'
            >
                {displayedTick.current}
            </Text>
            {process.env.REACT_APP_QUBIC_SHOW_TICK_SECONDS === 'true' && (
                <Text component='span'>
                    {' '}
                    ({secondPassedFromLastTickUpdate}
                    s)
                </Text>
            )}
        </Text>
    );
};
