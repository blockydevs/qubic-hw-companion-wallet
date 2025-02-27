import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import { useQubicLedgerAppContext } from '../hooks/UseQubicLedgerAppContext';

interface QubicLedgerDemoModeProviderProps {
    enabled?: boolean;
}

export const QubicLedgerDemoModeProvider = ({
    children,
    enabled = true,
}: PropsWithChildren<QubicLedgerDemoModeProviderProps>) => {
    const { generatedAddresses, addNewAddress } = useQubicLedgerAppContext();
    const isInitialized = useRef(false);

    const generateDemoAddress = async () => {
        const newAddressIndex = generatedAddresses ? generatedAddresses.length + 1 : 1;

        const addressDerivationPath = "m/44'/4218'/0'/0'/" + newAddressIndex;

        const publicKey = 'dummyPublicKey' + newAddressIndex;

        const identity = 'dummyIdentity' + newAddressIndex;

        const generatedAddressData = {
            identity,
            publicKey: Buffer.from(publicKey),
            addressDerivationPath,
            addressIndex: newAddressIndex,
            balance: '12345678',
        };

        addNewAddress(generatedAddressData);

        return generatedAddressData;
    };

    useEffect(() => {
        if (isInitialized.current || !enabled) {
            return;
        }

        isInitialized.current = true;

        generateDemoAddress();
    }, [generateDemoAddress]);

    return children;
};
