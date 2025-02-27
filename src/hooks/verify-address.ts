import { use, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { VerifiedAddressContext } from '@/providers/VerifiedAddressProvider';
import type { IQubicLedgerAddress } from '@/packages/hw-app-qubic-react/src/types';

export const useVerifiedAddressContext = () => {
    const verifiedAddressContext = use(VerifiedAddressContext);

    if (!verifiedAddressContext) {
        throw new Error('useVerifiedAddressContext must be used within a VerifiedAddressProvider');
    }

    return verifiedAddressContext;
};

export const useVerifyAddress = () => {
    const { verifyAddress, verifiedIdentities } = useVerifiedAddressContext();

    const handleVerifyAddress = useCallback(
        async (address: IQubicLedgerAddress, throwError = false) => {
            try {
                if (verifiedIdentities.includes(address.identity)) {
                    notifications.show({
                        title: 'Warning',
                        color: 'orange',
                        message: 'Address already verified',
                    });

                    return;
                }

                await verifyAddress(address);

                notifications.show({
                    title: 'Success',
                    message: 'Address verified successfully',
                });
            } catch (error) {
                notifications.show({
                    title: 'Error',
                    color: 'red',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Failed to verify address (Unknown reason)',
                });

                if (throwError) {
                    throw error;
                }
            }
        },
        [verifyAddress],
    );

    return {
        verifyAddress: handleVerifyAddress,
    };
};
