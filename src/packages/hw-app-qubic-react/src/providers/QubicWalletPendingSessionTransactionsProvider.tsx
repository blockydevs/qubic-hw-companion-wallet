import type { PropsWithChildren } from 'react';
import { createContext, useState } from 'react';
import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { useQubicCurrentTickQuery, useQubicRpcService } from '../../';
import type { IQubicPendingTransaction } from '../types';
import { setCache } from '../utils/local-storage-cache';

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
    >(JSON.parse(localStorage.getItem(QUBIC_WALLET_PENDING_SESSION_TRANSACTIONS_CACHE_KEY)) || []);

    const qubicRpc = useQubicRpcService();

    const { data: latestTick } = useQubicCurrentTickQuery();

    const pendingTransactionsQueries = useQueries({
        queries: trackedPendingTransactions.map((pendingTransactionData) => ({
            queryKey: ['transactionStatus', pendingTransactionData.txId, qubicRpc.getTransaction],
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
                pendingTransactionData.tick <= latestTick,
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
