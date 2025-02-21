import type { PropsWithChildren } from 'react';
import { use, useEffect } from 'react';
import { QubicLedgerContext } from './QubicLedgerProvider';
import { DeviceTypeContext } from '../../../../providers/DeviceTypeProvider';

export const QubicLedgerDemoModeProvider = ({ children }: PropsWithChildren) => {
    const ctx = use(QubicLedgerContext);
    const { deviceType } = use(DeviceTypeContext);

    const isDemoMode = deviceType === 'demo';

    const generateDemoAddress = async () => {
        const newAddressIndex = ctx?.generatedAddresses ? ctx.generatedAddresses.length + 1 : 1;

        const addressDerivationPath = "m/44'/4218'/0'/0'/" + newAddressIndex;

        const publicKey = 'dummyPublicKey' + newAddressIndex;

        const identity = 'dummyIdentity' + newAddressIndex;

        const generatedAddressData = {
            identity,
            publicKey,
            addressDerivationPath,
            addressIndex: newAddressIndex,
        };

        ctx?.addNewAddress(generatedAddressData);

        return generatedAddressData;
    };

    useEffect(() => {
        if (isDemoMode) {
            generateDemoAddress();
        }
    }, [isDemoMode]);

    if (!ctx) {
        throw new Error('QubicLedgerContext not found');
    }

    return children;
};
