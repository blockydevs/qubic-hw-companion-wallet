import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import type { IQubicPendingTransaction, QubicTransactionStatus } from '@/types';
import { useDisclosure } from '@mantine/hooks';
import { SentTransactionDetailsModal } from '@/components/sent-transaction-details-modal';
import { useQubicCurrentTickQuery, useQubicRpcService } from '@/packages/hw-app-qubic-react';
import { useMutation } from '@tanstack/react-query';
import {
    updateNotification,
    showNotification,
    useNotifications,
    hideNotification,
} from '@mantine/notifications';
import { Button, Group, Text } from '@mantine/core';
import { TruncatedText } from '@/components/truncated-text';
import { useLocation } from 'react-router';

interface IQubicWalletPendingSessionTransactionsContextProps {
    pendingTransactions: IQubicPendingTransaction[];
    addTransaction: (transaction: IQubicPendingTransaction) => void;
    updateTransactionStatus: (txId: string, status: QubicTransactionStatus) => void;

    openTransactionDetailsModalForId: (txId: string) => void;
    closeTransactionDetailsModal: () => void;
}

export const QubicWalletPendingSessionTransactionsContext =
    createContext<IQubicWalletPendingSessionTransactionsContextProps | null>(null);

export const QubicWalletPendingSessionTransactionsProvider = ({ children }: PropsWithChildren) => {
    const [pendingTransactions, setPendingTransactions] = useState<IQubicPendingTransaction[]>([]);

    const { pathname } = useLocation();

    const [
        isTransactionDetailsModalOpened,
        { open: openTransactionDetailsModal, close: closeTransactionDetailsModal },
    ] = useDisclosure();

    const [transactionIdForDetailsModal, setTransactionIdForDetailsModal] = useState<string | null>(
        null,
    );

    const selectedTransactionDetailsData = pendingTransactions.find(
        (tx) => tx.txId === transactionIdForDetailsModal,
    );

    const isAnyTransactionPending = pendingTransactions.some(
        (tx) => tx.status === 'pending' && tx.txId === transactionIdForDetailsModal,
    );

    const {
        data: latestTick,
        isLoading: isLatestTickLoading,
        isFetching: isLatestTickFetching,
        isRefetching: isLatestTickRefetching,
        refetch: refetchTickValue,
    } = useQubicCurrentTickQuery({
        enabled: isAnyTransactionPending,
        refetchInterval: 10000,
    });

    const latestKnownTick = useRef(latestTick);

    const isTickDataLoading = isLatestTickLoading || isLatestTickFetching || isLatestTickRefetching;

    const openTransactionDetailsModalForId = useCallback(
        (txId: string) => {
            setTransactionIdForDetailsModal(txId);
            openTransactionDetailsModal();
        },
        [openTransactionDetailsModal],
    );

    const addTransaction = (transaction: IQubicPendingTransaction) => {
        setPendingTransactions((prev) => [...prev, transaction]);
    };

    const getTransactionById = (txId: string) => pendingTransactions.find((tx) => tx.txId === txId);

    const updateTransactionStatus = (txId: string, status: QubicTransactionStatus) => {
        setPendingTransactions((prev) =>
            prev.map((tx) => (tx.txId === txId ? { ...tx, status } : tx)),
        );
    };

    const qubicRpc = useQubicRpcService();

    const mutationUpdateTransactionStatus = useMutation({
        mutationFn: async (transactionId: string) => {
            const transaction = getTransactionById(transactionId);

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            if (transaction.status !== 'pending') {
                return;
            }

            try {
                const txData = await qubicRpc.getTransaction({ transactionId });

                if (txData && txData.transaction) {
                    updateTransactionStatus(transactionId, 'success');
                }
            } catch {
                if (transaction.tick < latestTick) {
                    updateTransactionStatus(transactionId, 'failed');
                }
            }
        },
    });

    useEffect(() => {
        if (
            isTransactionDetailsModalOpened &&
            selectedTransactionDetailsData &&
            !isTickDataLoading &&
            latestTick &&
            latestKnownTick.current !== latestTick &&
            selectedTransactionDetailsData.createdAtTick <= latestTick &&
            selectedTransactionDetailsData.status === 'pending' &&
            !mutationUpdateTransactionStatus.isPending
        ) {
            latestKnownTick.current = latestTick;

            mutationUpdateTransactionStatus.mutate(selectedTransactionDetailsData.txId);
        }
    }, [
        isTransactionDetailsModalOpened,
        selectedTransactionDetailsData,
        refetchTickValue,
        isTickDataLoading,
        latestTick,
        mutationUpdateTransactionStatus,
    ]);

    const notificationsStore = useNotifications();

    const [manuallyClosedTransactionIds, setManuallyClosedTransactionIds] = useState<string[]>([]);

    useEffect(() => {
        pendingTransactions.forEach((tx) => {
            if (manuallyClosedTransactionIds.includes(tx.txId)) {
                return;
            }

            const isNotificationForTransactionShown = notificationsStore.notifications.find(
                (notification) => notification.id === `transaction-${tx.txId}`,
            );

            const notificationFunction = isNotificationForTransactionShown
                ? updateNotification
                : showNotification;

            notificationFunction({
                id: `transaction-${tx.txId}`,
                title: (
                    <div>
                        <Text display='inline-block'>Transaction </Text>{' '}
                        <TruncatedText c='brand' display='inline-block'>
                            {tx.txId}{' '}
                        </TruncatedText>{' '}
                        <Text display='inline-block'>{tx.status} </Text>
                    </div>
                ),
                loading: tx.status === 'pending',
                autoClose: tx.status === 'success',
                onClose: () => {
                    setManuallyClosedTransactionIds((prev) => [...prev, tx.txId]);
                },

                withCloseButton: tx.status !== 'pending',
                color:
                    tx.status === 'pending' ? 'brand' : tx.status === 'success' ? 'green' : 'red',
                message: (
                    <Group gap='0px'>
                        Click{' '}
                        <Button
                            size='compact-xs'
                            variant='subtle'
                            onClick={async () => {
                                closeTransactionDetailsModal();
                                await new Promise((resolve) => setTimeout(resolve, 300));
                                openTransactionDetailsModalForId(tx.txId);
                            }}
                        >
                            here
                        </Button>{' '}
                        to check transaction details.
                    </Group>
                ),
            });
        });
        // #FIXME: the notificationsStore in deps array cause infinite loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAnyTransactionPending, openTransactionDetailsModalForId, pendingTransactions]);

    useEffect(() => {
        if (pathname === '/' && pendingTransactions.length > 0) {
            pendingTransactions.forEach((tx) => {
                hideNotification(`transaction-${tx.txId}`);
            });

            setManuallyClosedTransactionIds([]);

            setPendingTransactions([]);
        }
    }, [pathname, pendingTransactions]);

    return (
        <QubicWalletPendingSessionTransactionsContext.Provider
            value={{
                pendingTransactions,
                addTransaction,
                updateTransactionStatus,
                openTransactionDetailsModalForId,
                closeTransactionDetailsModal,
            }}
        >
            <SentTransactionDetailsModal
                {...selectedTransactionDetailsData}
                currentTick={latestTick ?? 0}
                opened={isTransactionDetailsModalOpened}
                onClose={closeTransactionDetailsModal}
            />
            {children}
        </QubicWalletPendingSessionTransactionsContext.Provider>
    );
};
