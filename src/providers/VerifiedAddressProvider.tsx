import type { PropsWithChildren } from 'react';
import { createContext, use, useCallback, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { IQubicLedgerAddress } from '../packages/hw-app-qubic-react/src/types';
import { DeviceTypeContext } from './DeviceTypeProvider';
import { useQubicLedgerAppContext } from '../packages/hw-app-qubic-react/src/hooks/UseQubicLedgerAppContext';
import { useQubicLedgerAppDeriveredIndexCacheContext } from '../packages/hw-app-qubic-react';
import { FullScreenLoader } from '../components/full-screen-loader';

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

    const { app, selectedAddress } = useQubicLedgerAppContext();
    const { isLoadingAddressesFromCache } = useQubicLedgerAppDeriveredIndexCacheContext();

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
        if (!isLoadingAddressesFromCache) {
            verifyFirstDerivedAddressHandler();
        }
    }, [verifyFirstDerivedAddressHandler, isLoadingAddressesFromCache]);

    return (
        <VerifiedAddressContext value={{ verifiedIdentities, verifyAddress }}>
            <FullScreenLoader
                visible={isVerificationInProgress}
                message={overlayMessage}
                title='Action required'
            />

            {children}
        </VerifiedAddressContext>
    );
};
