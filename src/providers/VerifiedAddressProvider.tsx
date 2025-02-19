import { notifications } from '@mantine/notifications';
import type { PropsWithChildren } from 'react';
import { createContext, use, useCallback, useEffect, useState } from 'react';
import { QubicLedgerContext } from '../packages/hw-app-qubic-react/src/providers/QubicLedgerProvider';
import { IQubicLedgerAddress } from '../packages/hw-app-qubic-react/src/types';
import { Loader, LoadingOverlay, Stack, Text } from '@mantine/core';
import { DeviceTypeContext } from './DeviceTypeProvider';

interface IVerifiedAddressContext {
    verifiedIdentities: string[];
    verifyAddress: (qubicAddressToVerify: IQubicLedgerAddress) => Promise<void>;
}

export const VerifiedAddressContext = createContext<IVerifiedAddressContext>({
    verifiedIdentities: [],
    verifyAddress: async (_) => {},
});

export const VerifiedAddressProvider = ({ children }: PropsWithChildren) => {
    const { deviceType } = use(DeviceTypeContext);
    const [verifiedIdentities, setVerifiedIdentities] = useState<string[]>([]);
    const [isVerificationInProgress, setVerificationInProgress] = useState(false);

    const { app, selectedAddress } = use(QubicLedgerContext);

    const verifyAddress = useCallback(
        async (qubicAddressToVerify: IQubicLedgerAddress) => {
            if (deviceType === 'demo') {
                notifications.show({
                    title: 'Demo mode',
                    message: 'Verification is not available in demo mode',
                    autoClose: true,
                });
                return;
            }

            const isAddressVerified = verifiedIdentities.includes(qubicAddressToVerify.identity);

            if (selectedAddress?.identity === qubicAddressToVerify.identity && isAddressVerified) {
                return;
            }

            setVerificationInProgress(true);

            try {
                const publicKey = await app.getPublicKey(
                    qubicAddressToVerify.addressDerivationPath,
                    true,
                );

                const publicKeyHex = publicKey.toString('hex');

                if (publicKeyHex === qubicAddressToVerify.publicKey) {
                    notifications.show({
                        title: 'Success',
                        message: 'Address verified!',
                    });
                    setVerifiedIdentities((prev) => [...prev, qubicAddressToVerify.identity]);
                } else {
                    notifications.show({
                        title: 'Address not verified',
                        message: 'Address does not match',
                    });
                    setVerifiedIdentities((prev) =>
                        prev.filter((identity) => identity !== qubicAddressToVerify.identity),
                    );
                }
            } catch (e) {
                if (e.statusText === 'CONDITIONS_OF_USE_NOT_SATISFIED' && e.message) {
                    notifications.show({
                        title: 'Address not verified',
                        message: e.message,
                    });
                } else {
                    console.error(e);
                    notifications.show({
                        title: 'Address not verified',
                        message: 'Failed to verify address on the device',
                        color: 'red',
                    });
                }

                setVerifiedIdentities((prev) =>
                    prev.filter((identity) => identity !== qubicAddressToVerify.identity),
                );
            } finally {
                setVerificationInProgress(false);
            }
        },
        [app, verifiedIdentities, selectedAddress],
    );

    useEffect(() => {
        if (!selectedAddress) {
            return;
        }

        if (deviceType !== 'demo') {
            verifyAddress(selectedAddress);
        }
    }, [selectedAddress, deviceType, verifyAddress]);

    return (
        <VerifiedAddressContext value={{ verifiedIdentities, verifyAddress }}>
            <LoadingOverlay
                visible={isVerificationInProgress}
                zIndex={1000}
                loaderProps={{
                    children: (
                        <Stack justify='center' align='center' gap='xl'>
                            <Loader size='lg' />
                            <Stack gap='sm' justify='center' align='center'>
                                <Text size='h2'>Action required</Text>
                                <Text>Please verify the address on your device</Text>
                            </Stack>
                        </Stack>
                    ),
                }}
                overlayProps={{
                    radius: 'sm',
                    blur: 2,
                }}
            />
            {children}
        </VerifiedAddressContext>
    );
};
