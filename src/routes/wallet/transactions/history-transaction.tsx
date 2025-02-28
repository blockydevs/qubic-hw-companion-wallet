import {
    Anchor,
    Badge,
    Button,
    Collapse,
    Divider,
    em,
    Group,
    Stack,
    Text,
    Tooltip,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { TruncatedText } from '@/components/truncated-text';
import { copyAddress } from '@/utils/copy';
import { formatTimestamp } from '@/utils/date';
import { HistoryTransactionDetailItem } from '@/routes/wallet/transactions/history-transaction-detail-item';
import styles from '@/routes/wallet/transactions/transaction.module.css';

interface HistoryTransactionProps {
    transactionId: string;
    timestamp: string;
    amount: string;
    transactionType: 'incoming' | 'outgoing';
}

export const HistoryTransaction = ({
    transactionId,
    timestamp,
    transactionType,
    amount,
}: HistoryTransactionProps) => {
    const [opened, { toggle }] = useDisclosure(false);
    const shouldShowTransactionHashInCollapse = useMediaQuery(`(min-width: ${em(1024)})`);

    const ArrowIcon = transactionType === 'outgoing' ? ArrowUpwardIcon : ArrowDownwardIcon;

    return (
        <Group className={styles.transaction}>
            <Group className={styles.transactionGroup}>
                <Group>
                    <Badge
                        px='0.475rem'
                        h='1.5rem'
                        rightSection={
                            <CheckIcon
                                htmlColor='var(--mantine-color-green-filled)'
                                sx={{
                                    paddingBottom: '0.1rem',
                                    fontSize: '1.25rem',
                                    transform: 'scaleX(0.85)',
                                }}
                            />
                        }
                        color='#202e3c'
                        c='#808b9b'
                    >
                        TX
                    </Badge>

                    <ArrowIcon
                        htmlColor={
                            transactionType === 'outgoing'
                                ? 'var(--mantine-color-red-filled)'
                                : 'var(--mantine-color-green-filled)'
                        }
                    />
                </Group>

                <Group gap='xs'>
                    <Anchor
                        href={`https://explorer.qubic.org/network/tx/${transactionId}`}
                        target='_blank'
                        c='gray.0'
                    >
                        <TruncatedText c='brand'>{transactionId}</TruncatedText>
                    </Anchor>

                    <Tooltip label='Copy transaction hash' position='right'>
                        <Button
                            p='0.25rem'
                            variant='touch'
                            onClick={() => copyAddress(transactionId)}
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

            <Group className={styles.transactionGroup}>
                <Text size='lg'>
                    {amount}&nbsp;
                    <Text size='md' c='grey' component='span'>
                        QUBIC
                    </Text>
                </Text>
                <Button
                    variant='touch'
                    onClick={toggle}
                    p='0.5rem'
                    style={{
                        transition: 'transform 200ms',
                        transform: opened ? 'rotate(180deg)' : undefined,
                    }}
                >
                    <KeyboardArrowDownIcon
                        htmlColor='var(--mantine-color-fontColor-filled)'
                        sx={{
                            fontSize: '1.5rem',
                        }}
                    />
                </Button>
            </Group>

            <Collapse in={opened} w='100%' style={{ gap: '0.5rem' }}>
                <Divider pb='0.5rem' pt='0.25rem' />

                <Stack gap='sm'>
                    {shouldShowTransactionHashInCollapse && (
                        <HistoryTransactionDetailItem
                            label='TX ID'
                            component={
                                <>
                                    {' '}
                                    <Text c='brand'>{transactionId}</Text>
                                    <Tooltip label='Copy transaction hash' position='right'>
                                        <Button
                                            p='0.25rem'
                                            variant='touch'
                                            onClick={() => copyAddress(transactionId)}
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
                            }
                        />
                    )}
                    <HistoryTransactionDetailItem
                        label='Timestamp'
                        component={<Text>{formatTimestamp(timestamp)}</Text>}
                    />
                </Stack>
            </Collapse>
        </Group>
    );
};
