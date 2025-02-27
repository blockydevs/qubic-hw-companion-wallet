import { TruncatedText } from '@/components/truncated-text';
import type { ModalProps } from '@mantine/core';
import { Modal, Stack, Text, Anchor, Button } from '@mantine/core';
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
        <Stack align='center'>
            <Text size='lg' c='brand'>
                Sent!
            </Text>

            <Text fw={600}>Transaction ID</Text>

            <Anchor
                href={`https://explorer.qubic.org/network/tx/${sentTxId}`}
                target='_blank'
                c='brand'
                w={'calc(var(--modal-size) - 6rem)'}
                style={{ overflowWrap: 'break-word' }}
            >
                {sentTxId}
            </Anchor>

            <Text component='h2' fw={600}>
                {sentAmount} QUBIC
            </Text>

            <Text>sent to</Text>

            <TruncatedText
                w={'calc(var(--modal-size) - 6rem)'}
                style={{ overflowWrap: 'break-word' }}
            >
                {sentTo}
            </TruncatedText>

            <Button onClick={onClose}>Close</Button>
        </Stack>
    </Modal>
);
