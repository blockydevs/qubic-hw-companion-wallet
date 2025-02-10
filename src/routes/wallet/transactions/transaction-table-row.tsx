import { Anchor, Badge, Button, Group, Table, Text, Tooltip } from '@mantine/core';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TruncatedText } from '../../../components/truncated-text';
import { copyAddress } from '../../../utils/copy';
import { formatTimestamp } from '../../../utils/date';

interface TransactionTableRowProps {
    transactionId: string;
    timestamp: string;
    amount: number;
}

export const TransactionTableRow = ({
    transactionId,
    timestamp,
    amount,
}: TransactionTableRowProps) => (
    <Table.Tr>
        <Table.Td>
            <Group gap='xs'>
                <Anchor
                    href={`https://explorer.kaspa.org/txs/${transactionId}`}
                    target='_blank'
                    ff={'Roboto Mono,Courier New,Courier,monospace'}
                    fw={600}
                    c='gray.0'
                >
                    <TruncatedText fw={600} c='brand'>
                        {transactionId}
                    </TruncatedText>
                </Anchor>

                <Tooltip label='Copy transaction hash' position='right'>
                    <Button p='0.25rem' variant='touch' onClick={() => copyAddress(transactionId)}>
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
        </Table.Td>

        <Table.Td>
            <Text>{formatTimestamp(timestamp)}</Text>
        </Table.Td>

        <Table.Td>
            <Badge color={amount <= 0 ? 'red' : 'green'}>{amount}&nbsp;QUBIC</Badge>
        </Table.Td>
    </Table.Tr>
);
