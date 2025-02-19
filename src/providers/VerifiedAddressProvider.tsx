import { notifications } from '@mantine/notifications';
import type { PropsWithChildren } from 'react';
import { createContext, use, useCallback, useEffect, useState } from 'react';
import { QubicLedgerContext } from '../packages/hw-app-qubic-react/src/providers/QubicLedgerProvider';
import { IQubicLedgerAddress } from '../packages/hw-app-qubic-react/src/types';

interface IVerifiedAddressContext {
    verifiedIdentities: string[];
    verifyAddress: (qubicAddressToVerify: IQubicLedgerAddress) => Promise<void>;
}

export const VerifiedAddressContext = createContext<IVerifiedAddressContext>({
    verifiedIdentities: [],
    verifyAddress: async (_) => {},
});

export const VerifiedAddressProvider = ({ children }: PropsWithChildren) => {
    const [verifiedIdentities, setVerifiedIdentities] = useState<string[]>([]);

    const { app, selectedAddress } = use(QubicLedgerContext);

    const verifyAddress = useCallback(
        async (qubicAddressToVerify: IQubicLedgerAddress) => {
            const isAddressVerified = verifiedIdentities.includes(qubicAddressToVerify.identity);

            if (selectedAddress?.identity === qubicAddressToVerify.identity && isAddressVerified) {
                return;
            }

            const notifId = notifications.show({
                title: 'Action Required',
                message: 'Please verify the address on your device',
                loading: true,
                autoClose: false,
            });

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
                notifications.hide(notifId);
            }
        },
        [app, verifiedIdentities, selectedAddress],
    );

    useEffect(() => {
        if (!selectedAddress) {
            return;
        }

        verifyAddress(selectedAddress);
    }, [selectedAddress]);

    return (
        <VerifiedAddressContext value={{ verifiedIdentities, verifyAddress }}>
            {children}
        </VerifiedAddressContext>
    );
};
