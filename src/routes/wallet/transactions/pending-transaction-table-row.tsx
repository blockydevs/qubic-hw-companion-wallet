import { Badge, Group, Loader, Table, Text, Tooltip } from '@mantine/core';
import { IconReplace } from '@tabler/icons-react';
import { sompiToKas } from '../../../lib/kaspa-util';
import { TruncatedText } from '../../../components/truncated-text';

interface PendingTransactionTableRowProps {
    transactionId: string;
    sentAmount: bigint;
    onClick: () => void;
}

export const PendingTransactionTableRow = ({
    transactionId,
    sentAmount,
    onClick,
}: PendingTransactionTableRowProps) => (
    <Table.Tr>
        <Table.Td>
            <Group justify='space-between'>
                <Group>
                    <Text ff={'Roboto Mono,Courier New,Courier,monospace'} fw={600} c='gray.0'>
                        <TruncatedText>{transactionId}</TruncatedText>
                    </Text>
                </Group>

                <Group>
                    <Badge
                        color='cyan'
                        leftSection={<Loader size={16} />}
                        rightSection={
                            <Tooltip label='Initiate RBF'>
                                <IconReplace
                                    size={16}
                                    style={{ cursor: 'pointer' }}
                                    onClick={onClick}
                                />
                            </Tooltip>
                        }
                    >
                        Pending
                    </Badge>
                    <Badge color='red'>-{sompiToKas(Number(sentAmount))}&nbsp;QUBIC</Badge>
                </Group>
            </Group>
        </Table.Td>
    </Table.Tr>
);
