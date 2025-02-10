import { Group, Loader, Pagination, Table, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTransactionsPage } from './page.hooks';
import { PendingTransactionTableRow } from './pending-transaction-table-row';
import { TransactionTableRow } from './transaction-table-row';

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

    return (
        <>
            <Table>
                <Table.Tbody>
                    {(pendingRowsData ?? []).map(({ mempoolEntry, transactionId, sentAmount }) => (
                        <PendingTransactionTableRow
                            key={transactionId}
                            transactionId={transactionId}
                            sentAmount={sentAmount}
                            onClick={() => {
                                // Set the tx to replace, and switch to overview:
                                setMempoolEntryToReplace(mempoolEntry);
                                navigate('/wallet/overview');
                            }}
                        />
                    ))}
                </Table.Tbody>
            </Table>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Transaction hash</Table.Th>
                        <Table.Th>Timestamp</Table.Th>
                        <Table.Th>Amount</Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {(transactions || []).map(({ transactionId, timestamp, amount }) => (
                        <TransactionTableRow
                            key={transactionId}
                            transactionId={transactionId}
                            timestamp={timestamp}
                            amount={amount}
                        />
                    ))}
                </Table.Tbody>
            </Table>

            <Group w='100%' justify='space-between'>
                <Group>
                    <Text fw={600}>Total Transactions: {txCount}</Text>
                    {loading ? <Loader size={20} /> : null}
                </Group>

                <Pagination total={maxPages} value={page} onChange={setPage}></Pagination>
            </Group>
        </>
    );
};
