import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { QUBIC_WALLET_LAST_CACHED_INDEXES_LOCAL_STORAGE_KEY } from '../constants';
import { useQubicLedgerApp } from '../hooks/use-qubic-ledger-app';
import { getCache, setCache } from '../utils/local-storage-cache';

interface IQubicLedgerAppDeriveredIndexCacheContext {
    isLoadingAddressesFromCache: boolean;
}

interface QubicLedgerAppDeriveredIndexCacheProps {
    enabled?: boolean;
}

export const QubicLedgerAppDeriveredIndexCacheContext =
    createContext<IQubicLedgerAppDeriveredIndexCacheContext | null>(null);

export const QubicLedgerAppDeriveredIndexCache = ({
    children,
    enabled = true,
}: PropsWithChildren<QubicLedgerAppDeriveredIndexCacheProps>) => {
    const { generatedAddresses, deriveNewAddress } = useQubicLedgerApp();
    const [isLoadingAddressesFromCache, setIsLoadingAddressesFromCache] = useState(false);
    const isInitialized = useRef(false);

    const deriveCachedAddresses = useCallback(async () => {
        const lastDeriveredAddressFromCache =
            getCache<string>(QUBIC_WALLET_LAST_CACHED_INDEXES_LOCAL_STORAGE_KEY) || 0;

        if (!lastDeriveredAddressFromCache) {
            return;
        }

        setIsLoadingAddressesFromCache(true);

        for (let i = 0; i < parseInt(lastDeriveredAddressFromCache); i++) {
            await deriveNewAddress(i);
        }

        setIsLoadingAddressesFromCache(false);
    }, [deriveNewAddress]);

    const updateLastDeriveredAddressIndexInLocalStorage = useCallback(() => {
        const lastDeriveredAddressIndex = generatedAddresses.length;

        const lastDeriveredAddressFromCache =
            getCache<number>(QUBIC_WALLET_LAST_CACHED_INDEXES_LOCAL_STORAGE_KEY) || 0;

        if (lastDeriveredAddressIndex <= lastDeriveredAddressFromCache) {
            return;
        }

        setCache(QUBIC_WALLET_LAST_CACHED_INDEXES_LOCAL_STORAGE_KEY, lastDeriveredAddressIndex);
    }, [generatedAddresses, setCache]);

    useEffect(() => {
        if (isInitialized.current || !enabled) {
            return;
        }

        isInitialized.current = true;

        deriveCachedAddresses();
    }, [deriveCachedAddresses]);

    useEffect(() => {
        if (isLoadingAddressesFromCache || !enabled) {
            return;
        }

        updateLastDeriveredAddressIndexInLocalStorage();
    }, [updateLastDeriveredAddressIndexInLocalStorage, isLoadingAddressesFromCache]);

    return (
        <QubicLedgerAppDeriveredIndexCacheContext value={{ isLoadingAddressesFromCache }}>
            {children}
        </QubicLedgerAppDeriveredIndexCacheContext>
    );
};
