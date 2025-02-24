import { useCallback, useState } from 'react';
import qubic from '@qubic-lib/qubic-ts-library';
import { useQubicLedgerAppContext } from './UseQubicLedgerAppContext';
import { generateDerivationPathForGivenIndex } from '../utils/derivation-path';
import { getBalance } from '../utils/rpc';
import { MAX_ADDRESS_INDEX } from '../constants';
import type { IQubicLedgerAddress } from '../types';

const getBalanceHandler = async (identity: string) => {
    try {
        const balanceResponse = await getBalance(identity);

        return balanceResponse.balance;
    } catch {
        return '0';
    }
};

export const useQubicLedgerApp = () => {
    const {
        app,
        initApp,
        reset,
        generatedAddresses,
        selectedAddress,
        derivationPath,
        setSelectedAddressIndex,
        addNewAddress,
    } = useQubicLedgerAppContext();

    const [isGeneratingAddress, setIsGeneratingAddress] = useState(false);
    const isAppInitialized = Boolean(app);

    const getVersion = useCallback(async () => {
        if (!app) {
            return null;
        }

        return await app.getVersion();
    }, [app]);

    const deriveNewAddress = useCallback(
        async (newAddressIndex = generatedAddresses.length) => {
            if (!app) {
                throw new Error('QubicLedgerApp not initialized');
            }

            setIsGeneratingAddress(true);

            try {
                if (newAddressIndex > MAX_ADDRESS_INDEX) {
                    throw new Error('Maximum address index reached');
                }

                if (newAddressIndex < generatedAddresses.length) {
                    throw new Error('Address with this index already exists');
                }

                const addressDerivationPath = generateDerivationPathForGivenIndex(
                    derivationPath,
                    newAddressIndex,
                );

                const publicKey = await app.getPublicKey(addressDerivationPath);

                const identity = await new qubic.QubicHelper().getIdentity(publicKey);

                const balance = await getBalanceHandler(identity);

                const generatedAddressData: IQubicLedgerAddress = {
                    identity,
                    publicKey: Buffer.from(publicKey).toString('hex'),
                    addressDerivationPath,
                    addressIndex: newAddressIndex,
                    balance,
                };

                addNewAddress(generatedAddressData);

                return generatedAddressData;
            } catch (error) {
                throw new Error(`Error generating new address: ${error.message}`);
            } finally {
                setIsGeneratingAddress(false);
            }
        },
        [app, addNewAddress, generatedAddresses, derivationPath, setIsGeneratingAddress],
    );

    const selectAddressByIndex = useCallback(
        (index: number) => {
            if (!generatedAddresses.length) {
                throw new Error('No generated addresses. Generate address first.');
            }

            if (index < 0 || index > generatedAddresses.length - 1) {
                throw new Error('Selected address index is out of bounds');
            }

            setSelectedAddressIndex(index);
        },
        [generatedAddresses, setSelectedAddressIndex],
    );

    const clearSelectedAddress = useCallback(() => {
        setSelectedAddressIndex(null);
    }, [setSelectedAddressIndex]);

    return {
        app,
        isAppInitialized,
        generatedAddresses,
        selectedAddress,
        isGeneratingAddress,
        selectAddressByIndex,
        initApp,
        getVersion,
        deriveNewAddress,
        clearSelectedAddress,
        reset,
    };
};
