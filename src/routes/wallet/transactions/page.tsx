import { Link } from 'react-router';
import { Button, em, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
    useQubicLedgerApp,
    useQubicWalletPendingSessionTransactionsContext,
} from '@/packages/hw-app-qubic-react';
import { HistoryTransactions } from './-components/history-transactions';
import { PendingTransactions } from './-components/pending-transactions';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryFactory } from '@/utils/query-factory';

const LIMIT = 50;

export const WalletTransactionsPage = () => {
    const queryClient = useQueryClient();
    const { selectedAddress } = useQubicLedgerApp();
    const qubicWalletPendingSessionTransactionsContext =
        useQubicWalletPendingSessionTransactionsContext();

    const [lastKnownAmountOfPendingTransactions, setLastKnownAmountOfPendingTransactions] =
        useState(qubicWalletPendingSessionTransactionsContext.pendingTransactions.length);

    const shouldShowTransactionHashInCollapse = useMediaQuery(`(min-width: ${em(1024)})`);

    const [page, setPage] = useState(0);

    const pendingTransactions =
        qubicWalletPendingSessionTransactionsContext.pendingTransactions.filter(
            (tx) => tx.status === 'pending',
        );

    useEffect(() => {
        if (!selectedAddress) {
            return;
        }

        const tempLastKnownAmountOfPendingTransactions = lastKnownAmountOfPendingTransactions;

        if (tempLastKnownAmountOfPendingTransactions !== pendingTransactions.length) {
            setLastKnownAmountOfPendingTransactions(pendingTransactions.length);
        }

        if (pendingTransactions.length < tempLastKnownAmountOfPendingTransactions) {
            queryClient.invalidateQueries(
                queryFactory.getTransactions.forIdentity({
                    identity: selectedAddress.identity,
                    offset: LIMIT * page,
                    size: LIMIT,
                }),
            );
        }
    }, [
        lastKnownAmountOfPendingTransactions,
        page,
        pendingTransactions,
        queryClient,
        selectedAddress,
    ]);

    if (!selectedAddress) {
        return (
            <Stack w='100%' gap='xl'>
                <Stack>
                    <Title component='p' size='h2'>
                        No transactions found
                    </Title>
                    <Stack>
                        <Text>Please select an address to view transactions</Text>

                        <Link to='/wallet/addresses'>
                            <Button>Go to address page</Button>
                        </Link>
                    </Stack>
                </Stack>
            </Stack>
        );
    }

    return (
        <Stack w='100%' gap='xl'>
            {pendingTransactions.length > 0 && (
                <PendingTransactions
                    pendingTransactions={pendingTransactions}
                    shouldShowTransactionHashInCollapse={shouldShowTransactionHashInCollapse}
                />
            )}

            <HistoryTransactions page={page} setPage={setPage} limit={LIMIT} />
        </Stack>
    );
};
