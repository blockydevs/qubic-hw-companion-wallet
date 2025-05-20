import { Button, em, Group, Loader, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
    useQubicCurrentTickQuery,
    useQubicLedgerApp,
    useQubicWholeTransactionsHistoryInfiniteQuery,
} from '@/packages/hw-app-qubic-react';
import { HistoryTransaction } from '@/routes/wallet/transactions/history-transaction';
import { copyAddress } from '@/utils/copy';
import { formatTimestamp } from '@/utils/date';

export const HistoryTransactions = () => {
    const { selectedAddress } = useQubicLedgerApp();
    const { data: latestTick } = useQubicCurrentTickQuery();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading: transactionsLoading,
        endTick,
        firstTick,
        reset,
    } = useQubicWholeTransactionsHistoryInfiniteQuery({
        identity: selectedAddress?.identity,
        initialTick: latestTick,
    });

    const shouldShowTransactionHashInCollapse = useMediaQuery(`(min-width: ${em(1024)})`);

    const showUpdateFirstTickButton =
        firstTick + parseInt(process.env.REACT_APP_TRANSACTION_TICK_OFFSET) <= latestTick;

    const transactionsData = data?.pages?.flatMap((el) => el.transactions) ?? [];

    return (
        <Stack>
            <Group display='flex' gap='12'>
                <Title component='p' size='h2'>
                    Transactions{' '}
                </Title>
                {showUpdateFirstTickButton && (
                    <Button onClick={reset} variant='subtle'>
                        Update first tick to {latestTick}
                    </Button>
                )}
            </Group>

            <Stack gap='xs' w='100%'>
                {transactionsData.map(({ identity, tickNumber, transactions }) => (
                    <HistoryTransaction
                        key={`${identity}-${tickNumber}-${transactions[0].transaction.txId}`}
                        icon={
                            transactions[0].transaction.sourceId === identity ? (
                                <ArrowUpwardIcon htmlColor='var(--mantine-color-red-filled)' />
                            ) : (
                                <ArrowDownwardIcon htmlColor='var(--mantine-color-green-filled)' />
                            )
                        }
                        transactionId={transactions[0].transaction.txId}
                        amount={transactions[0].transaction.amount}
                        collapseItems={[
                            ...(shouldShowTransactionHashInCollapse
                                ? [
                                      {
                                          label: 'TX ID',
                                          component: (
                                              <>
                                                  {' '}
                                                  <Text c='brand'>
                                                      {transactions[0].transaction.txId}
                                                  </Text>
                                                  <Tooltip
                                                      label='Copy transaction hash'
                                                      position='right'
                                                  >
                                                      <Button
                                                          p='0.25rem'
                                                          variant='touch'
                                                          onClick={() =>
                                                              copyAddress(
                                                                  transactions[0].transaction.txId,
                                                              )
                                                          }
                                                      >
                                                          <ContentCopyIcon
                                                              htmlColor='var(--mantine-color-fontColor-filled)'
                                                              sx={{
                                                                  width: '1rem',
                                                                  height: '1rem',
                                                              }}
                                                          />
                                                      </Button>
                                                  </Tooltip>
                                              </>
                                          ),
                                      },
                                  ]
                                : []),
                            {
                                label: 'Timestamp',
                                component: (
                                    <Text>{formatTimestamp(transactions[0].timestamp)}</Text>
                                ),
                            },
                        ]}
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
                    {showUpdateFirstTickButton && (
                        <Button onClick={reset} variant='subtle'>
                            Update first tick to {latestTick}
                        </Button>
                    )}
                </Group>
            </Group>
        </Stack>
    );
};
