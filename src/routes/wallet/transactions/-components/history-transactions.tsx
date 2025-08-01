import {
    Button,
    Card,
    Center,
    em,
    Group,
    Skeleton,
    Stack,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useQubicLedgerApp } from '@/packages/hw-app-qubic-react';
import { HistoryTransaction } from '@/routes/wallet/transactions/history-transaction';
import { copyAddress } from '@/utils/copy';
import { formatTimestamp } from '@/utils/date';
import { useQuery } from '@tanstack/react-query';
import { queryFactory } from '@/utils/query-factory';
import { useEffect, useMemo, useState } from 'react';
import { Pagination } from '@mantine/core';
import { TruncatedText } from '@/components/truncated-text';
import { Link } from 'react-router';

interface Props {
    page: number;
    setPage: (page: number) => void;
    limit: number;
}

export const HistoryTransactions = ({ page, setPage, limit }: Props) => {
    const [lastKnownTotal, setLastKnownTotal] = useState<number | null>(null);

    const { selectedAddress, generatedAddresses } = useQubicLedgerApp();

    const { data, refetch, isError, isLoading } = useQuery(
        queryFactory.getTransactions.forIdentity({
            identity: selectedAddress?.identity,
            offset: page * limit,
            size: limit,
        }),
    );

    useEffect(() => {
        if (lastKnownTotal !== undefined && data?.hits?.total !== undefined) {
            setLastKnownTotal(data.hits.total);
        }
    }, [data, lastKnownTotal]);

    const shouldShowTransactionHashInCollapse = useMediaQuery(`(min-width: ${em(1024)})`);

    const transactionsComponent = useMemo(() => {
        if (isError) {
            return (
                <Card w='100%'>
                    <Stack gap='sm'>
                        <Title component='p' size='h2'>
                            Error{' '}
                        </Title>
                        <Text>
                            An error occurred while fetching transactions. Please try again later.
                        </Text>

                        <Button
                            w='max-content'
                            onClick={() => {
                                refetch();
                            }}
                        >
                            Retry
                        </Button>
                    </Stack>
                </Card>
            );
        }

        if (isLoading) {
            return Array.from({ length: limit }).map((_, index) => (
                <Skeleton key={`loading-${index}`}>
                    <HistoryTransaction
                        icon={<ArrowUpwardIcon htmlColor='var(--mantine-color-red-filled)' />}
                        transactionId='Loading...'
                        amount='Loading...'
                        collapseItems={[
                            {
                                label: 'TX ID',
                                component: <Text>Loading...</Text>,
                            },
                            {
                                label: 'Timestamp',
                                component: <Text>Loading...</Text>,
                            },
                            {
                                label: 'Source',
                                component: <Text>Loading...</Text>,
                            },
                            {
                                label: 'Destination',
                                component: <Text>Loading...</Text>,
                            },
                        ]}
                    />
                </Skeleton>
            ));
        }

        return data.transactions.map(
            ({ source, destination, timestamp, tickNumber, hash, amount }) => (
                <HistoryTransaction
                    key={`${selectedAddress.identity}-${source}-${tickNumber}-${hash}`}
                    icon={
                        selectedAddress.identity === source ? (
                            <ArrowUpwardIcon htmlColor='var(--mantine-color-red-filled)' />
                        ) : (
                            <ArrowDownwardIcon htmlColor='var(--mantine-color-green-filled)' />
                        )
                    }
                    transactionId={hash}
                    amount={amount}
                    collapseItems={[
                        ...(shouldShowTransactionHashInCollapse
                            ? [
                                  {
                                      label: 'TX ID',
                                      component: (
                                          <>
                                              {' '}
                                              <Text c='brand'>{hash}</Text>
                                              <Tooltip
                                                  label='Copy transaction hash'
                                                  position='right'
                                              >
                                                  <Button
                                                      p='0.25rem'
                                                      variant='touch'
                                                      onClick={() => copyAddress(hash)}
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
                            component: <Text>{formatTimestamp(timestamp)}</Text>,
                        },
                        {
                            label: 'Source',
                            component: (
                                <>
                                    {' '}
                                    <Text c='brand'>{source}</Text>
                                    <Tooltip label='Copy source identity' position='right'>
                                        <Button
                                            p='0.25rem'
                                            variant='touch'
                                            onClick={() => copyAddress(source)}
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
                        {
                            label: 'Destination',
                            component: (
                                <>
                                    {' '}
                                    <Text c='brand'>{destination}</Text>
                                    <Tooltip label='Copy destination identity' position='right'>
                                        <Button
                                            p='0.25rem'
                                            variant='touch'
                                            onClick={() => copyAddress(destination)}
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
                    ]}
                />
            ),
        );
    }, [
        isError,
        isLoading,
        data?.transactions,
        refetch,
        limit,
        selectedAddress.identity,
        shouldShowTransactionHashInCollapse,
    ]);

    return (
        <Stack>
            <Stack display='flex' gap='12'>
                {generatedAddresses.length > 1 && (
                    <Link to='/wallet/addresses'>
                        <Button w='max-content' variant='outline' onClick={() => setPage(0)}>
                            Change Address
                        </Button>
                    </Link>
                )}
                <Group justify='space-between' align='center' w='max-content'>
                    <Title component='p' size='h2'>
                        Transactions of Account {selectedAddress.addressIndex + 1}
                    </Title>
                    <Group gap='xs' align='center'>
                        <TruncatedText size='sm' c='grey'>
                            ({selectedAddress.identity})
                        </TruncatedText>
                        <Tooltip label='Copy Address'>
                            <Button
                                p='0.25rem'
                                variant='touch'
                                onClick={() => copyAddress(selectedAddress.identity)}
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
                    </Group>
                </Group>
                <Text fw={600}>Total Transactions: {lastKnownTotal ?? 0}</Text>
            </Stack>

            <Stack gap='xs' w='100%'>
                {transactionsComponent}
            </Stack>

            {!isError && (
                <Center w='100%' mt='md'>
                    <Stack>
                        <Pagination
                            disabled={isLoading}
                            total={Math.ceil((lastKnownTotal ?? 0) / limit)}
                            onChange={(newPage) => setPage(newPage - 1)}
                            value={page + 1}
                            withEdges
                            withControls
                            siblings={1}
                            boundaries={1}
                            styles={(theme) => ({
                                control: {
                                    '&[data-active]': {
                                        backgroundColor: theme.colors.brand[6],
                                        color: theme.white,
                                    },
                                },
                            })}
                        />

                        <Text size='sm' c='grey' mx='auto'>
                            Page {page + 1} of {Math.ceil((lastKnownTotal ?? 0) / limit)}
                        </Text>
                    </Stack>
                </Center>
            )}
        </Stack>
    );
};
