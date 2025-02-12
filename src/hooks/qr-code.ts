import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

export const useQrCodeModal = (initialAddress: string) => {
    const [isQrCodeModalOpened, { open: openQrCodeModal, close: closeQrCodeModal }] =
        useDisclosure(false);

    const [qrCodeAddress, setQrCodeAddress] = useState(initialAddress ?? '');

    const handleOpenQrCodeModal = (address: string) => {
        setQrCodeAddress(address);
        openQrCodeModal();
    };

    return {
        isQrCodeModalOpened,
        handleOpenQrCodeModal,
        closeQrCodeModal,
        qrCodeAddress,
    };
};
