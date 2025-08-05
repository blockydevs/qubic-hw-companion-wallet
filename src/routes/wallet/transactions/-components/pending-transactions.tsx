import { Button, Loader, Stack, Text, Title, Tooltip } from '@mantine/core';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TransactionProgress } from '@/components/transaction-progress';
import { IQubicPendingTransaction, useQubicCurrentTickQuery } from '@/packages/hw-app-qubic-react';
import { HistoryTransaction } from '@/routes/wallet/transactions/history-transaction';
import { copyAddress } from '@/utils/copy';

interface Props {
    pendingTransactions: IQubicPendingTransaction[];
    shouldShowTransactionHashInCollapse?: boolean;
}

export const PendingTransactions = ({
    pendingTransactions,
    shouldShowTransactionHashInCollapse,
}: Props) => {
    const { data: latestTick } = useQubicCurrentTickQuery();

    return (
        <Stack>
            <Title component='p' size='h2'>
                Pending Transactions
            </Title>

            <Stack gap='xs' w='100%'>
                {pendingTransactions.map(({ amount, createdAtTick, tick, to, txId, status }) => (
                    <HistoryTransaction
                        key={`${txId}-${createdAtTick}-${tick}-${to}`}
                        icon={<Loader />}
                        transactionId={txId}
                        amount={amount.toString()}
                        collapseItems={[
                            ...(shouldShowTransactionHashInCollapse
                                ? [
                                      {
                                          label: 'TX ID',
                                          component: (
                                              <>
                                                  {' '}
                                                  <Text c='brand'>{txId}</Text>
                                                  <Tooltip
                                                      label='Copy transaction hash'
                                                      position='right'
                                                  >
                                                      <Button
                                                          p='0.25rem'
                                                          variant='touch'
                                                          onClick={() => copyAddress(txId)}
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
                                label: 'Target tick',
                                component: <Text>{tick}</Text>,
                            },
                            {
                                label: 'Progress',
                                component: (
                                    <TransactionProgress
                                        miw='200px'
                                        currentTick={latestTick}
                                        targetTick={tick}
                                        status={status}
                                    />
                                ),
                            },
                        ]}
                    />
                ))}
            </Stack>
        </Stack>
    );
};
