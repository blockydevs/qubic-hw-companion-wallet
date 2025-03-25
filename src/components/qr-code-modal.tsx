import React from 'react';
import { Group, Modal } from '@mantine/core';
import { QrCode } from '@/components/qr-code';

interface QrCodeModalProps {
    isQrCodeModalOpened: boolean;
    closeQrCodeModal: () => void;
    qrCodeAddress: string;
}

export const QrCodeModal = ({
    closeQrCodeModal,
    isQrCodeModalOpened,
    qrCodeAddress,
}: QrCodeModalProps) => (
    <Modal opened={isQrCodeModalOpened} onClose={closeQrCodeModal} title='QR Code' centered>
        <Group mx='auto' w='100%' justify='center' p='md'>
            <QrCode value={qrCodeAddress} title={qrCodeAddress} />
        </Group>
    </Modal>
);
