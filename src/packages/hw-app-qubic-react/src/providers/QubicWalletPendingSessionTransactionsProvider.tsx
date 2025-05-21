import type { PropsWithChildren } from 'react';
import { createContext, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { useQueries, UseQueryResult } from '@tanstack/react-query';
import {
    useQubicCurrentTickQuery,
    useQubicLedgerApp,
    useQubicLedgerAppDeriveredIndexCacheContext,
    useQubicRpcService,
} from '../../';
import type { IQubicPendingTransaction } from '../types';
import { getCache, removeCache, setCache } from '../utils/local-storage-cache';
import { qubicPendingTransactionSchema } from '../utils/validation-schemas';

interface IQubicWalletPendingSessionTransactionsContextProps {
    pendingTransactions: IQubicPendingTransaction[];
    addTransaction: (transaction: IQubicPendingTransaction) => void;
    removeTransaction: (txId: string) => void;
}

export const QUBIC_WALLET_PENDING_SESSION_TRANSACTIONS_CACHE_KEY =
    'qubic_wallet_pending_session_transactions';

export const QubicWalletPendingSessionTransactionsContext =
    createContext<IQubicWalletPendingSessionTransactionsContextProps | null>(null);

export const removeTransactionFromCache = (txId: string) => {
    const pendingTransactions = JSON.parse(
        localStorage.getItem(QUBIC_WALLET_PENDING_SESSION_TRANSACTIONS_CACHE_KEY) || '[]',
    ) as IQubicPendingTransaction[];

    if (!pendingTransactions) {
        return [];
    }

    const updatedTransactions = pendingTransactions.filter((tx) => tx.txId !== txId);
    setCache(QUBIC_WALLET_PENDING_SESSION_TRANSACTIONS_CACHE_KEY, updatedTransactions);

    return updatedTransactions;
};

const addTransactionToCache = (
    pendingTransactions: IQubicPendingTransaction[],
    transaction: IQubicPendingTransaction,
) => {
    const updatedTransactions = [...pendingTransactions, transaction];
    setCache(QUBIC_WALLET_PENDING_SESSION_TRANSACTIONS_CACHE_KEY, updatedTransactions);

    return updatedTransactions;
};

export const QubicWalletPendingSessionTransactionsProvider = ({ children }: PropsWithChildren) => {
    const [trackedPendingTransactions, setTrackedPendingTransactions] = useState<
        IQubicPendingTransaction[]
    >([]);
    const wasInitialized = useRef(false);

    const qubicRpc = useQubicRpcService();

    const { data: latestTick } = useQubicCurrentTickQuery();
    const { isLoadingAddressesFromCache } = useQubicLedgerAppDeriveredIndexCacheContext();
    const { generatedAddresses, isGeneratingAddress, isAppInitialized } = useQubicLedgerApp();

    const pendingTransactionsQueries = useQueries({
        queries: trackedPendingTransactions.map((pendingTransactionData) => ({
            queryKey: [
                'transactionStatus',
                pendingTransactionData.txId,
                generatedAddresses,
                qubicRpc.getTransaction,
            ],
            queryFn: async () => {
                if (!pendingTransactionData) {
                    throw new Error('Pending Transaction Data not found');
                }

                const txData = await qubicRpc.getTransaction({
                    transactionId: pendingTransactionData.txId,
                });

                if (!txData || !txData.transaction) {
                    throw new Error('Transaction data not found');
                }

                return {
                    txId: txData.transaction.txId,
                    status: 'success' as const,
                };
            },
            enabled:
                pendingTransactionData?.status === 'pending' &&
                pendingTransactionData.tick <= latestTick &&
                isAppInitialized &&
                !isLoadingAddressesFromCache &&
                !isGeneratingAddress &&
                generatedAddresses.length > 0,
            retry: 3,
            refetchOnWindowFocus: false,
        })),
        combine: (results) =>
            trackedPendingTransactions.map((trackedPendingTransaction, index) => {
                const result = results[index];

                if (result.failureCount < 4 && result?.data?.status !== 'success') {
                    return {
                        ...result,
                        data: {
                            ...trackedPendingTransaction,
                            status: 'pending' as const,
                        },
                    };
                }

                removeTransactionFromCache(trackedPendingTransaction?.txId);

                return {
                    ...result,
                    data: {
                        ...trackedPendingTransaction,
                        status: result?.data?.status ?? 'failed',
                    },
                };
            }) as UseQueryResult<IQubicPendingTransaction, Error>[],
    });

    const addTransaction = (transaction: Omit<IQubicPendingTransaction, 'status'>) => {
        const newTransaction = {
            ...transaction,
            status: 'pending' as const,
        };

        setTrackedPendingTransactions((prev) => addTransactionToCache(prev, newTransaction));
    };

    const removeTransaction = (txId: string) => {
        setTrackedPendingTransactions(() => removeTransactionFromCache(txId));
    };

    useEffect(() => {
        const shouldSkip =
            wasInitialized.current ||
            !isAppInitialized ||
            isLoadingAddressesFromCache ||
            isGeneratingAddress ||
            !generatedAddresses.length;

        if (shouldSkip) {
            return;
        }

        wasInitialized.current = true;

        try {
            const cacheData = getCache(QUBIC_WALLET_PENDING_SESSION_TRANSACTIONS_CACHE_KEY);

            const validation = z.array(qubicPendingTransactionSchema).safeParse(cacheData);

            if (!validation.success) {
                console.error(
                    'Invalid pending transactions format in localStorage:',
                    validation.error,
                );

                removeCache(QUBIC_WALLET_PENDING_SESSION_TRANSACTIONS_CACHE_KEY);

                return;
            }

            if (
                !validation.data.filter((tx) =>
                    generatedAddresses.map(({ identity }) => identity).includes(tx.from),
                )
            ) {
                console.error('No addresses found in pending transactions in localStorage:', {
                    generatedAddresses,
                    localStoragePendingTransactions: validation.data.map(({ from }) => from),
                });

                return;
            }

            setTrackedPendingTransactions(validation.data as IQubicPendingTransaction[]);
        } catch (error) {
            console.error('Failed to parse pending transactions from localStorage:', error);

            removeCache(QUBIC_WALLET_PENDING_SESSION_TRANSACTIONS_CACHE_KEY);
        }
    }, [
        isAppInitialized,
        isLoadingAddressesFromCache,
        isGeneratingAddress,
        generatedAddresses,
        setTrackedPendingTransactions,
    ]);

    return (
        <QubicWalletPendingSessionTransactionsContext.Provider
            value={{
                pendingTransactions: pendingTransactionsQueries.map(({ data }) => data),
                addTransaction,
                removeTransaction,
            }}
        >
            {children}
        </QubicWalletPendingSessionTransactionsContext.Provider>
    );
};
