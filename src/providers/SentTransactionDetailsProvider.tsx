import { SentTransactionDetailsModal } from '@/components/sent-transaction-details-modal';
import { TruncatedText } from '@/components/truncated-text';
import { useQubicCurrentTickQuery } from '@/packages/hw-app-qubic-react';
import { useQubicWalletPendingSessionTransactionsContext } from '@/packages/hw-app-qubic-react';
import type { QubicTransactionStatus } from '@/packages/hw-app-qubic-react';
import { Anchor, Group, Loader, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification, updateNotification, useNotifications } from '@mantine/notifications';
import type { PropsWithChildren } from 'react';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

interface ISentTransactionDetailsContext {
    openTransactionDetailsModalForId: (txId: string) => void;
}

export const SentTransactionDetailsContext = createContext<ISentTransactionDetailsContext | null>(
    null,
);

type SentTransactionLabelProps = { href?: string };

const sentTransactionDataMap: Record<
    QubicTransactionStatus,
    {
        beforeLabel?: React.ReactNode;
        label: (props: SentTransactionLabelProps) => React.ReactNode;
        progressColor: string;
    }
> = {
    pending: {
        beforeLabel: <Loader size='xs' />,
        label: () => (
            <Text size='sm' c='grey'>
                Please wait until target tick has been reached
            </Text>
        ),
        progressColor: 'brand',
    },
    success: {
        label: ({ href }: { href?: string }) => (
            <Text c='green'>
                Transaction successful - {href ? <Anchor href={href}>LINK</Anchor> : 'LINK'}
            </Text>
        ),
        progressColor: 'green',
    },
    failed: {
        label: () => <Text c='red'>Transaction not successful, please retry</Text>,
        progressColor: 'red',
    },
    unknown: {
        label: () => <Text c='orange'>Cannot connect, please try again later</Text>,
        progressColor: 'orange',
    },
};

export const SentTransactionDetailsProvider = ({ children }: PropsWithChildren) => {
    const qubicWalletPendingSessionTransactionsContext =
        useQubicWalletPendingSessionTransactionsContext();

    const [transactionIdForDetailsModal, setTransactionIdForDetailsModal] = useState<string | null>(
        null,
    );

    const [
        isTransactionDetailsModalOpened,
        { open: openTransactionDetailsModal, close: closeTransactionDetailsModal },
    ] = useDisclosure();

    const { notifications } = useNotifications();

    const { data: latestTick } = useQubicCurrentTickQuery();

    const selectedTransactionDetailsData = useMemo(
        () =>
            qubicWalletPendingSessionTransactionsContext.pendingTransactions.find(
                (tx) => tx.txId === transactionIdForDetailsModal,
            ),
        [
            qubicWalletPendingSessionTransactionsContext.pendingTransactions,
            transactionIdForDetailsModal,
        ],
    );

    const openTransactionDetailsModalForId = useCallback(
        (txId: string) => {
            setTransactionIdForDetailsModal(txId);
            openTransactionDetailsModal();
        },
        [openTransactionDetailsModal],
    );

    const handleCloseTransactionDetailsModal = useCallback(() => {
        if (
            selectedTransactionDetailsData?.status === 'success' ||
            selectedTransactionDetailsData?.status === 'failed'
        ) {
            qubicWalletPendingSessionTransactionsContext.removeTransaction(
                selectedTransactionDetailsData.txId,
            );

            updateNotification({
                id: `transaction-${selectedTransactionDetailsData.txId}`,
                autoClose: 1,
                message: <Text>Transaction removed</Text>,
            });
        }

        closeTransactionDetailsModal();
    }, [
        closeTransactionDetailsModal,
        qubicWalletPendingSessionTransactionsContext,
        selectedTransactionDetailsData?.status,
        selectedTransactionDetailsData?.txId,
    ]);

    useEffect(() => {
        qubicWalletPendingSessionTransactionsContext.pendingTransactions.forEach((tx) => {
            const isNotificationForTransactionShown = notifications.find(
                (notification) => notification.id === `transaction-${tx.txId}`,
            );

            const notificationFunction = isNotificationForTransactionShown
                ? updateNotification
                : showNotification;

            notificationFunction({
                id: `transaction-${tx.txId}`,

                loading: tx.status === 'pending',
                onClose: () => {
                    if (
                        isTransactionDetailsModalOpened &&
                        tx.txId === transactionIdForDetailsModal
                    ) {
                        closeTransactionDetailsModal();
                    }
                },
                autoClose: false,
                withCloseButton: tx.status !== 'pending',
                color:
                    tx.status === 'pending' ? 'brand' : tx.status === 'success' ? 'green' : 'red',
                onClick: async () => {
                    if (
                        isTransactionDetailsModalOpened &&
                        tx.txId !== transactionIdForDetailsModal
                    ) {
                        closeTransactionDetailsModal();
                        await new Promise((resolve) => setTimeout(resolve, 300));
                    }

                    openTransactionDetailsModalForId(tx.txId);
                },
                title: (
                    <div>
                        <Text display='inline-block'>Transaction </Text>{' '}
                        <TruncatedText c='brand' display='inline-block'>
                            {tx.txId}{' '}
                        </TruncatedText>{' '}
                        <Text display='inline-block'>{tx.status} </Text>
                    </div>
                ),
                message: (
                    <Group gap='4px'>
                        {tx.status === 'pending' && (
                            <Text c='grey'>Please wait until target tick has been reached</Text>
                        )}
                        <Group gap='4px'>
                            Click <Anchor>here</Anchor> to check transaction details.
                        </Group>
                    </Group>
                ),
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- #FIXME: this is a workaround to avoid infinite loop
    }, [
        closeTransactionDetailsModal,
        isTransactionDetailsModalOpened,
        //notifications, // <-- this is causing infinite loop
        openTransactionDetailsModalForId,
        qubicWalletPendingSessionTransactionsContext,
        transactionIdForDetailsModal,
    ]);

    return (
        <SentTransactionDetailsContext.Provider value={{ openTransactionDetailsModalForId }}>
            <SentTransactionDetailsModal
                amount={selectedTransactionDetailsData?.amount}
                tick={selectedTransactionDetailsData?.tick}
                currentTick={latestTick ?? 0}
                status={selectedTransactionDetailsData?.status ?? ('pending' as const)}
                label={sentTransactionDataMap[
                    selectedTransactionDetailsData?.status ?? ('pending' as const)
                ].label({
                    href: selectedTransactionDetailsData?.txId
                        ? `https://explorer.qubic.org/network/tx/${selectedTransactionDetailsData.txId}`
                        : undefined,
                })}
                beforeLabel={
                    sentTransactionDataMap[
                        selectedTransactionDetailsData?.status ?? ('pending' as const)
                    ].beforeLabel
                }
                progressColor={
                    sentTransactionDataMap[selectedTransactionDetailsData?.status ?? 'pending']
                        .progressColor
                }
                to={selectedTransactionDetailsData?.to}
                txId={selectedTransactionDetailsData?.txId}
                opened={isTransactionDetailsModalOpened}
                onClose={handleCloseTransactionDetailsModal}
            />

            {children}
        </SentTransactionDetailsContext.Provider>
    );
};
