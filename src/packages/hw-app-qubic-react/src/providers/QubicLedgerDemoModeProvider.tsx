import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useQubicLedgerAppContext } from '../hooks/UseQubicLedgerAppContext';

interface QubicLedgerDemoModeProviderProps {
    enabled?: boolean;
}

export const QubicLedgerDemoModeProvider = ({
    children,
    enabled = true,
}: PropsWithChildren<QubicLedgerDemoModeProviderProps>) => {
    const { generatedAddresses, addNewAddress } = useQubicLedgerAppContext();

    const generateDemoAddress = async () => {
        const newAddressIndex = generatedAddresses ? generatedAddresses.length + 1 : 1;

        const addressDerivationPath = "m/44'/4218'/0'/0'/" + newAddressIndex;

        const publicKey = 'dummyPublicKey' + newAddressIndex;

        const identity = 'dummyIdentity' + newAddressIndex;

        const generatedAddressData = {
            identity,
            publicKey,
            addressDerivationPath,
            addressIndex: newAddressIndex,
        };

        addNewAddress(generatedAddressData);

        return generatedAddressData;
    };

    useEffect(() => {
        if (enabled) {
            generateDemoAddress();
        }
    }, [enabled]);

    return children;
};
