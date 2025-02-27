import type { PropsWithChildren } from 'react';
import { createContext, use, useCallback, useState } from 'react';
import { FullScreenLoader } from '@/components/full-screen-loader';
import { useQubicLedgerAppContext } from '@/packages/hw-app-qubic-react/src/hooks/use-qubic-ledger-app-context';
import { DeviceTypeContext } from '@/providers/DeviceTypeProvider';
import { IQubicLedgerAddress } from '@/packages/hw-app-qubic-react/src/types';

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

    const overlayMessage =
        verifiedIdentities.length > 0
            ? `Please verify the ${addressInVerificationProcess} address on your device.`
            : `Before continuing to interact with the app, verify the first address (${addressInVerificationProcess}) on your device.`;

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

                if (publicKey.toString('hex') === qubicAddressToVerify.publicKey.toString('hex')) {
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
