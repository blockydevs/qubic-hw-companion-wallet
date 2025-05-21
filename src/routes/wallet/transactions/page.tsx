import { Link } from 'react-router';
import { Button, em, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
    useQubicLedgerApp,
    useQubicWalletPendingSessionTransactionsContext,
} from '@/packages/hw-app-qubic-react';
import { HistoryTransactions } from './-components/history-transactions';
import { PendingTransactions } from './-components/pending-transactions';

export const WalletTransactionsPage = () => {
    const { selectedAddress } = useQubicLedgerApp();
    const qubicWalletPendingSessionTransactionsContext =
        useQubicWalletPendingSessionTransactionsContext();

    const shouldShowTransactionHashInCollapse = useMediaQuery(`(min-width: ${em(1024)})`);

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

    const pendingTransactions =
        qubicWalletPendingSessionTransactionsContext.pendingTransactions.filter(
            (tx) => tx.status === 'pending',
        );

    return (
        <Stack w='100%' gap='xl'>
            {pendingTransactions.length > 0 && (
                <PendingTransactions
                    pendingTransactions={pendingTransactions}
                    shouldShowTransactionHashInCollapse={shouldShowTransactionHashInCollapse}
                />
            )}

            <HistoryTransactions />
        </Stack>
    );
};
