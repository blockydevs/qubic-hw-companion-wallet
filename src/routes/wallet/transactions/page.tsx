import { Link } from 'react-router';
import { Button, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { HistoryTransaction } from '@/routes/wallet/transactions/history-transaction';
import {
    useQubicCurrentTickQuery,
    useQubicLedgerApp,
    useQubicWholeTransactionsHistoryInfiniteQuery,
} from '@/packages/hw-app-qubic-react';

export const WalletTransactionsPage = () => {
    const { selectedAddress } = useQubicLedgerApp();
    const { data: latestTick } = useQubicCurrentTickQuery();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading: transactionsLoading,
        endTick,
        firstTick,
    } = useQubicWholeTransactionsHistoryInfiniteQuery({
        identity: selectedAddress?.identity,
        initialTick: latestTick,
    });

    const transactionsData = data?.pages?.flatMap((el) => el.transactions) ?? [];

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
            <Stack>
                <Title component='p' size='h2'>
                    Transactions
                </Title>

                <Stack gap='xs' w='100%'>
                    {transactionsData.map(({ identity, tickNumber, transactions }) => (
                        <HistoryTransaction
                            key={`${identity}-${tickNumber}`}
                            transactionId={transactions[0].transaction.txId}
                            timestamp={transactions[0].timestamp}
                            amount={transactions[0].transaction.amount}
                            transactionType={
                                transactions[0].transaction.sourceId === identity
                                    ? 'outgoing'
                                    : 'incoming'
                            }
                        />
                    ))}
                </Stack>

                <Group w='100%' justify='space-between'>
                    <Group>
                        <Text fw={600}>Total Transactions: {transactionsData?.length ?? 0}</Text>
                        <Text>
                            Show transactions from {firstTick} to {endTick} tick
                        </Text>

                        {transactionsLoading ? (
                            <Loader size={20} />
                        ) : (
                            <Button
                                disabled={!hasNextPage}
                                onClick={() => {
                                    fetchNextPage();
                                }}
                            >
                                {hasNextPage ? 'Load More' : 'No More Transactions'}
                            </Button>
                        )}
                    </Group>
                </Group>
            </Stack>
        </Stack>
    );
};
