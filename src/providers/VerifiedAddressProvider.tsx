import { notifications } from '@mantine/notifications';
import type { PropsWithChildren } from 'react';
import { createContext, use, useCallback, useEffect, useState } from 'react';
import { QubicLedgerContext } from '../packages/hw-app-qubic-react/src/providers/QubicLedgerProvider';
import { IQubicLedgerAddress } from '../packages/hw-app-qubic-react/src/types';
import { Loader, LoadingOverlay, Paper, Stack, Text, Title } from '@mantine/core';
import { DeviceTypeContext } from './DeviceTypeProvider';

interface IVerifiedAddressContext {
    verifiedIdentities: string[];
    verifyAddress: (qubicAddressToVerify: IQubicLedgerAddress) => Promise<boolean>;
}

export const VerifiedAddressContext = createContext<IVerifiedAddressContext>({
    verifiedIdentities: [],
    verifyAddress: async (_) => false,
});

export const VerifiedAddressProvider = ({ children }: PropsWithChildren) => {
    const { deviceType } = use(DeviceTypeContext);
    const [verifiedIdentities, setVerifiedIdentities] = useState<string[]>([]);
    const [addressInVerificationProcess, setAddressInVerificationProcess] = useState<string | null>(
        null,
    );

    const isVerificationInProgress = Boolean(addressInVerificationProcess);

    const { app, selectedAddress } = use(QubicLedgerContext);

    const overlayMessage =
        verifiedIdentities.length > 0
            ? `Please verify the ${addressInVerificationProcess} address on your device.`
            : `Before continuing to interact with the app, verify the ${addressInVerificationProcess} address on your device.`;

    const verifyAddress = useCallback(
        async (qubicAddressToVerify: IQubicLedgerAddress) => {
            if (deviceType === 'demo') {
                throw new Error('Verification is not available in demo mode');
            }

            const isAddressVerified = verifiedIdentities.includes(qubicAddressToVerify.identity);

            if (selectedAddress?.identity === qubicAddressToVerify.identity && isAddressVerified) {
                return true;
            }

            setAddressInVerificationProcess(qubicAddressToVerify.identity);

            try {
                const publicKey = await app.getPublicKey(
                    qubicAddressToVerify.addressDerivationPath,
                    true,
                );

                const publicKeyHex = publicKey.toString('hex');

                if (publicKeyHex === qubicAddressToVerify.publicKey) {
                    setVerifiedIdentities((prev) => [...prev, qubicAddressToVerify.identity]);
                } else {
                    setVerifiedIdentities((prev) =>
                        prev.filter((identity) => identity !== qubicAddressToVerify.identity),
                    );
                }

                return true;
            } catch (e) {
                setVerifiedIdentities((prev) =>
                    prev.filter((identity) => identity !== qubicAddressToVerify.identity),
                );

                if (e?.statusText === 'CONDITIONS_OF_USE_NOT_SATISFIED' && e?.message) {
                    throw new Error('Address not verified: ' + e.message);
                }

                throw new Error('Failed to verify address on the device');
            } finally {
                setAddressInVerificationProcess(null);
            }
        },
        [app, verifiedIdentities, selectedAddress],
    );

    const verifyFirstDerivedAddressHandler = useCallback(async () => {
        if (!selectedAddress || deviceType === 'demo') {
            return;
        }

        if (selectedAddress && !verifiedIdentities.length) {
            try {
                await verifyAddress(selectedAddress);

                notifications.show({
                    title: 'Success',
                    message: 'Address verified successfully',
                });
            } catch (e) {
                notifications.show({
                    title: 'Error',
                    message:
                        e instanceof Error ? e.message : 'Failed to verify address on the device',
                });
            }
        }
    }, [selectedAddress, deviceType, verifiedIdentities.length, verifyAddress, verifiedIdentities]);

    useEffect(() => {
        verifyFirstDerivedAddressHandler();
    }, [verifyFirstDerivedAddressHandler]);

    return (
        <VerifiedAddressContext value={{ verifiedIdentities, verifyAddress }}>
            <LoadingOverlay
                visible={isVerificationInProgress}
                zIndex={1000}
                transitionProps={{ transition: 'fade', duration: 0.3 }}
                loaderProps={{
                    children: (
                        <Paper bg='cardBackgroundTransaprent'>
                            <Stack justify='center' align='center' maw='645px' p='md'>
                                <Loader size='lg' />
                                <Stack gap='xs'>
                                    <Title ta='center' component='p' size='h2'>
                                        Action required
                                    </Title>
                                    <Text
                                        ta='center'
                                        style={{
                                            overflowWrap: 'anywhere',
                                        }}
                                    >
                                        {overlayMessage}
                                    </Text>
                                </Stack>
                            </Stack>
                        </Paper>
                    ),
                }}
                overlayProps={{
                    color: 'black',
                    radius: 'sm',
                    blur: 2,
                    zIndex: 399, // to be behind notification toasts
                    p: 'sm',
                }}
            />
            {children}
        </VerifiedAddressContext>
    );
};
