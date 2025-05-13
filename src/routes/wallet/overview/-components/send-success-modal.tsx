import { TruncatedText } from '@/components/truncated-text';
import type { ModalProps } from '@mantine/core';
import { Modal, Stack, Text, Anchor, Button, Title, Paper } from '@mantine/core';
import React from 'react';

interface SendSuccessModalProps extends ModalProps {
    sentTxId: string;
    sentAmount: number;
    sentTo: string;
}

export const SendSuccessModal = ({
    sentTxId,
    sentAmount,
    sentTo,
    onClose,
    ...modalProps
}: SendSuccessModalProps) => (
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
                        {sentAmount} QUBIC
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
                        {sentTo}
                    </TruncatedText>
                </Stack>

                <Stack gap='xs'>
                    <Text fw={600}>Transaction ID</Text>

                    <Anchor
                        href={`https://explorer.qubic.org/network/tx/${sentTxId}`}
                        target='_blank'
                        c='brand'
                        w='calc(var(--modal-size) - 6rem)'
                        style={{ overflowWrap: 'break-word' }}
                    >
                        {sentTxId}
                    </Anchor>
                </Stack>
            </Paper>

            <Button onClick={onClose}>Close</Button>
        </Stack>
    </Modal>
);
