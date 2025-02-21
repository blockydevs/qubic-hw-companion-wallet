import { Anchor, Badge, Button, Group, Loader, Text, Tooltip } from '@mantine/core';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded';
import { TruncatedText } from '@/components/truncated-text';
import { sompiToKas } from '@/lib/kaspa-util';
import styles from '@/routes/wallet/transactions/transaction.module.css';
import { copyAddress } from '@/utils/copy';

interface PendingTransactionProps {
    transactionId: string;
    sentAmount: bigint;
    onClick: () => void;
}

export const PendingTransaction = ({
    transactionId,
    sentAmount,
    onClick,
}: PendingTransactionProps) => {
    return (
        <Group className={styles.transaction}>
            <Group className={styles.transactionGroup}>
                <Group>
                    <Badge px='0.475rem' h='1.5rem' color='#202e3c' c='#808b9b'>
                        TX
                    </Badge>
                    <Loader size='xs' />
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
                    {sompiToKas(Number(sentAmount))}&nbsp;
                    <Text size='md' c='grey' component='span'>
                        QUBIC
                    </Text>
                </Text>
                <Button
                    onClick={onClick}
                    variant='light'
                    rightSection={
                        <Button variant='touch' p='0.5rem'>
                            <PublishedWithChangesRoundedIcon
                                sx={{ fontSize: '1.25rem' }}
                                htmlColor='var(--mantine-color-brand-filled)'
                            />
                        </Button>
                    }
                >
                    Initiate RBF
                </Button>
            </Group>
        </Group>
    );
};
