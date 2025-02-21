import React, { useCallback, useState } from 'react';
import { useQubicLedgerApp, QubicLedgerProvider } from '../';

const INIT_STATUS_MAP = {
    idle: 'HW Qubic App is not initialized', // Default state
    initializing: 'Initializing app...',
    initialized: 'App initialized',
    initializationFailed: 'Failed to initialize app',
};

export const TestPage = () => (
    <QubicLedgerProvider derivationPath='' init={false}>
        <TestPageContent />
    </QubicLedgerProvider>
);

export const TestPageContent = () => {
    const {
        isAppInitialized,
        generatedAddresses,
        deriveNewAddress,
        getVersion,
        initApp,
        selectAddressByIndex,
        selectedAddress,
    } = useQubicLedgerApp();

    const [initStatus, setInitStatus] = useState(INIT_STATUS_MAP.idle);

    const initAppHandler = useCallback(async () => {
        setInitStatus(INIT_STATUS_MAP.initializing);
        try {
            await initApp();

            setInitStatus(INIT_STATUS_MAP.initialized);
        } catch (e) {
            setInitStatus(
                INIT_STATUS_MAP.initializationFailed + (e instanceof Error ? `: ${e.message}` : ''),
            );
        }
    }, [initApp]);

    const getVersionHandler = useCallback(async () => {
        try {
            const versionResponse = await getVersion();
            console.log('Version Response:', versionResponse);
        } catch (error) {
            console.error('Error getting version:', error);
        }
    }, [getVersion]);

    const deriveNewAddressHandler = useCallback(async () => {
        try {
            const newGeneratedAddress = await deriveNewAddress();
            console.log('Generated address:', newGeneratedAddress);
        } catch (error) {
            console.error('Error generating new address:', error);
        }
    }, [deriveNewAddress]);

    return (
        <div>
            <p>App Initialized: {isAppInitialized ? 'Yes' : 'No'}</p>

            <p>{initStatus}</p>

            <button onClick={initAppHandler} disabled={isAppInitialized}>
                Init
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button disabled={!isAppInitialized} onClick={getVersionHandler}>
                    Get version
                </button>
                <button disabled={!isAppInitialized} onClick={deriveNewAddressHandler}>
                    Derive new address
                </button>
            </div>

            {generatedAddresses?.length > 0 && (
                <div>
                    <h4>Selected address: {selectedAddress?.identity} </h4>
                    <hr />
                    <h3>Generated Addresses:</h3>
                    <ul>
                        {generatedAddresses.map((address, index) => (
                            <li key={index}>
                                <p>Address Index: {address.addressIndex}</p>
                                <p>Public Key: {address.publicKey}</p>
                                <p>Identity: {address.identity}</p>
                                <p>Derivation Path: {address.addressDerivationPath}</p>
                                <button
                                    disabled={selectedAddress?.identity === address.identity}
                                    onClick={() => selectAddressByIndex(index)}
                                    type='button'
                                >
                                    Select
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
