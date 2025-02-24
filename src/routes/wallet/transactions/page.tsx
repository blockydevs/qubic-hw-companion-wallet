import { Divider, Group, Loader, Pagination, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTransactionsPage } from '@/routes/wallet/transactions/page.hooks';
import { PendingTransaction } from '@/routes/wallet/transactions/pending-transaction';
import { HistoryTransaction } from '@/routes/wallet/transactions/history-transaction';

export const WalletTransactionsPage = () => {
    const {
        setMempoolEntryToReplace,
        transactions,
        page,
        setPage,
        txCount,
        maxPages,
        loading,
        pendingRowsData,
    } = useTransactionsPage();
    const navigate = useNavigate();

    const hasPendingTransactions = pendingRowsData?.length > 0;

    return (
        <Stack w='100%' gap='xl'>
            {hasPendingTransactions && (
                <>
                    <Stack>
                        <Title component='p' size='h2'>
                            Pending transactions
                        </Title>
                        <Stack gap='xs' w='100%'>
                            {(pendingRowsData ?? []).map(
                                ({ mempoolEntry, transactionId, sentAmount }) => (
                                    <PendingTransaction
                                        key={transactionId}
                                        transactionId={transactionId}
                                        sentAmount={sentAmount}
                                        onClick={() => {
                                            // Set the tx to replace, and switch to overview:
                                            setMempoolEntryToReplace(mempoolEntry);
                                            navigate('/wallet/overview');
                                        }}
                                    />
                                ),
                            )}
                        </Stack>
                    </Stack>

                    <Divider />
                </>
            )}

            <Stack>
                <Title component='p' size='h2'>
                    Transactions
                </Title>
                <Stack gap='xs' w='100%'>
                    {(transactions || []).map(({ transactionId, timestamp, amount, isSuccess }) => (
                        <HistoryTransaction
                            key={transactionId}
                            isSuccess={isSuccess}
                            transactionId={transactionId}
                            timestamp={timestamp}
                            amount={amount}
                        />
                    ))}
                </Stack>

                <Group w='100%' justify='space-between'>
                    <Group>
                        <Text fw={600}>Total Transactions: {txCount}</Text>
                        {loading ? <Loader size={20} /> : null}
                    </Group>

                    <Pagination total={maxPages} value={page} onChange={setPage}></Pagination>
                </Group>
            </Stack>
        </Stack>
    );
};
