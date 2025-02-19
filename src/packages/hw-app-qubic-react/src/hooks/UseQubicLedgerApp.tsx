import { use, useCallback, useState } from 'react';
import { QubicLedgerContext } from '../providers/QubicLedgerProvider';
import { getAddressFromDerivationPathByIndex } from '../utils/derivation-path';
import qubic from '@qubic-lib/qubic-ts-library';

const MAX_ADDRESS_INDEX = 255;

export const useQubicLedgerApp = () => {
    const ctx = use(QubicLedgerContext);

    const [isGeneratingAddress, setIsGeneratingAddress] = useState(false);
    const isAppInitialized = Boolean(ctx?.app);

    const getVersion = useCallback(async () => {
        if (!ctx?.app) {
            return null;
        }

        return await ctx.app.getVersion();
    }, [ctx?.app]);

    const deriveNewAddress = useCallback(async () => {
        if (!ctx?.app) {
            throw new Error('QubicLedgerApp not initialized');
        }

        setIsGeneratingAddress(true);

        try {
            const newAddressIndex = ctx.generatedAddresses.length + 1;

            if (newAddressIndex > MAX_ADDRESS_INDEX) {
                throw new Error('Maximum address index reached');
            }

            const addressDerivationPath = getAddressFromDerivationPathByIndex(
                ctx.derivationPath,
                newAddressIndex,
            );

            const publicKey = await ctx.app.getPublicKey(addressDerivationPath);

            const identity = await new qubic.QubicHelper().getIdentity(publicKey);

            const generatedAddressData = {
                identity,
                publicKey: Buffer.from(publicKey).toString('hex'),
                addressDerivationPath,
                addressindex: newAddressIndex,
            };

            ctx.addNewAddress(generatedAddressData);

            return generatedAddressData;
        } catch (error) {
            throw new Error(`Error generating new address: ${error.message}`);
        } finally {
            setIsGeneratingAddress(false);
        }
    }, [ctx?.app, ctx?.addNewAddress, ctx?.generatedAddresses]);

    const selectAddressByIndex = useCallback(
        (index: number) => {
            if (!ctx?.generatedAddresses.length) {
                throw new Error('No generated addresses. Generate address first.');
            }

            if (index < 0 || index > ctx.generatedAddresses.length - 1) {
                throw new Error('Selected address index is out of bounds');
            }

            ctx.setSelectedAddressIndex(index);
        },
        [ctx?.generatedAddresses, ctx?.setSelectedAddressIndex],
    );

    const clearSelectedAddress = useCallback(() => {
        ctx.setSelectedAddressIndex(null);
    }, [ctx?.setSelectedAddressIndex]);

    if (!ctx) {
        throw new Error('The "useQubicLedgerApp" is used outside of the "QubicLedgerProvider"');
    }

    const { app, initApp } = ctx;

    return {
        app,
        isAppInitialized,
        generatedAddresses: ctx.generatedAddresses,
        selectedAddress: ctx.selectedAddress,
        isGeneratingAddress,
        selectAddressByIndex,
        initApp,
        getVersion,
        deriveNewAddress,
        clearSelectedAddress,
    };
};
