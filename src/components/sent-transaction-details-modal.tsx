import type { ModalProps } from '@mantine/core';
import { Button, Divider, Group, Modal, Paper, Stack, Text, Title } from '@mantine/core';
import { TruncatedText } from '@/components/truncated-text';
import { TransactionProgress } from '@/components/transaction-progress';
import type {
    IQubicPendingTransaction,
    QubicTransactionStatus,
} from '@/packages/hw-app-qubic-react';

interface SentTransactionDetailsModalProps
    extends ModalProps,
        Omit<IQubicPendingTransaction, 'status' | 'from' | 'createdAtTick'> {
    currentTick: number;
    label: React.ReactNode;
    beforeLabel?: React.ReactNode;
    status: QubicTransactionStatus;
    progressColor: string;
}

export const SentTransactionDetailsModal = ({
    amount,
    label,
    beforeLabel,
    tick,
    currentTick,
    to,
    txId,
    status,
    onClose,
    progressColor,
    ...modalProps
}: SentTransactionDetailsModalProps) => (
    <Modal centered withCloseButton={false} onClose={onClose} {...modalProps}>
        <Stack align='center' ta='center' gap='lg' w='full'>
            <Title component='p' size='xl' c='brand'>
                Sent!
            </Title>

            <Paper component={Stack} p='sm' bg='cardActiveBackground' gap='lg'>
                <Stack gap='xs'>
                    <Title size='md' component='p' fw={600}>
                        Amount
                    </Title>

                    <Text component='h2' fw={600} c='brand'>
                        {amount} QUBIC
                    </Text>
                </Stack>

                <Stack gap='xs'>
                    <Title size='md' component='p' fw={600}>
                        Sent to
                    </Title>

                    <TruncatedText
                        component='a'
                        href={`${process.env.REACT_APP_QUBIC_EXPLORER_BASE_URL}/${process.env.REACT_APP_QUBIC_EXPLORER_ADDRESS_ENDPOINT}/${to}`}
                        target='_blank'
                        c='brand'
                        w='max-content'
                        mx='auto'
                        style={{ overflowWrap: 'break-word' }}
                        className='hover-text-underline'
                    >
                        {to}
                    </TruncatedText>
                </Stack>

                <Stack gap='xs'>
                    <Text fw={600}>Transaction ID</Text>

                    <TruncatedText
                        component='a'
                        href={`${process.env.REACT_APP_QUBIC_EXPLORER_BASE_URL}/${process.env.REACT_APP_QUBIC_EXPLORER_TRANSACTION_ENDPOINT}/${txId}`}
                        target='_blank'
                        c='brand'
                        w='max-content'
                        mx='auto'
                        style={{ overflowWrap: 'break-word' }}
                        className='hover-text-underline'
                    >
                        {txId}
                    </TruncatedText>
                </Stack>

                <Divider
                    size='md'
                    label='Keep this windows open to follow the status'
                    labelPosition='center'
                />

                <Group display='flex' justify='center' gap='xl'>
                    <Stack gap='xs'>
                        <Text fw={600}>Current tick</Text>

                        <Text component='h2' fw={600} c='brand'>
                            {currentTick}
                        </Text>
                    </Stack>

                    <Stack gap='xs'>
                        <Text fw={600}>Target tick</Text>

                        <Text component='h2' fw={600} c='brand'>
                            {tick}
                        </Text>
                    </Stack>
                </Group>

                <Stack gap='xs'>
                    <Group display='flex' justify='center' gap='xs'>
                        {beforeLabel && beforeLabel}

                        {label}
                    </Group>

                    <TransactionProgress
                        currentTick={currentTick}
                        targetTick={tick}
                        status={status}
                        progressColor={progressColor}
                        c={progressColor}
                    />
                </Stack>
            </Paper>

            <Button onClick={onClose}>Close</Button>
        </Stack>
    </Modal>
);
