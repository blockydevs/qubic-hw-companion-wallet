import type { PropsWithChildren } from 'react';
import { use, useEffect } from 'react';
import { DeviceTypeContext } from '../../../../providers/DeviceTypeProvider';
import { useQubicLedgerAppContext } from '../hooks/UseQubicLedgerAppContext';

export const QubicLedgerDemoModeProvider = ({ children }: PropsWithChildren) => {
    const { generatedAddresses, addNewAddress } = useQubicLedgerAppContext();
    const { deviceType } = use(DeviceTypeContext);

    const isDemoMode = deviceType === 'demo';

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
        if (isDemoMode) {
            generateDemoAddress();
        }
    }, [isDemoMode]);

    return children;
};
