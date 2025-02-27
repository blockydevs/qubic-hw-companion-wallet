import { useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import type { IQubicLedgerAddress } from '@/packages/hw-app-qubic-react/src/types';
import { useVerifiedAddressContext } from '@/hooks/verify-address-context';

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
