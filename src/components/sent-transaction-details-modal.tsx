import { TruncatedText } from '@/components/truncated-text';
import { IQubicPendingTransaction } from '@/types';
import type { ModalProps } from '@mantine/core';
import { Modal, Stack, Text, Anchor, Button, Title, Paper } from '@mantine/core';
import React from 'react';

interface SentTransactionDetailsModalProps extends ModalProps, IQubicPendingTransaction {
    currentTick: number;
}

export const SentTransactionDetailsModal = ({
    amount,
    status,
    tick,
    currentTick,
    to,
    txId,
    onClose,
    ...modalProps
}: SentTransactionDetailsModalProps) => (
    <Modal centered withCloseButton={false} onClose={onClose} {...modalProps}>
        <Stack align='center' ta='center' gap='lg'>
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
                        w='calc(var(--modal-size) - 6rem)'
                        style={{ overflowWrap: 'break-word' }}
                        c='brand'
                    >
                        {to}
                    </TruncatedText>
                </Stack>

                <Stack gap='xs'>
                    <Text fw={600}>Transaction ID</Text>

                    <Anchor
                        href={`https://explorer.qubic.org/network/tx/${txId}`}
                        target='_blank'
                        c='brand'
                        w='calc(var(--modal-size) - 6rem)'
                        style={{ overflowWrap: 'break-word' }}
                    >
                        {txId}
                    </Anchor>
                </Stack>

                <Stack gap='xs'>
                    <Text fw={600}>Current tick</Text>

                    <Text component='h2' fw={600} c='brand'>
                        {currentTick}
                    </Text>
                </Stack>

                <Stack gap='xs'>
                    <Text fw={600}>Transaction tick</Text>

                    <Text component='h2' fw={600} c='brand'>
                        {tick}
                    </Text>
                </Stack>

                <Stack gap='xs'>
                    <Text fw={600}>Transaction status</Text>

                    <Text component='h2' fw={600} c='brand'>
                        {status}
                    </Text>
                </Stack>
            </Paper>

            <Button onClick={onClose}>Close</Button>
        </Stack>
    </Modal>
);
