import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HWAppQubic } from '../../../hw-app-qubic';
import { LedgerWebHIDContext, LedgerWebHIDProvider } from './LedgerWebHIDProvider';
import type { IQubicLedgerAddress } from '../types';

export interface IQubicLedgerAppContext {
    app: HWAppQubic | null;
    selectedAddress: IQubicLedgerAddress | null;
    generatedAddresses: IQubicLedgerAddress[];
    derivationPath: string;
    initApp: () => Promise<HWAppQubic>;
    addNewAddress: (generatedAddressData: IQubicLedgerAddress) => void;
    setSelectedAddressIndex: (index: number) => void;
    reset: () => void;
}

export const QubicLedgerAppContext = createContext<IQubicLedgerAppContext | null>(null);

interface QubicLedgerAppProviderProps {
    init?: boolean;
    derivationPath: string;
}

const QubicLedgerAppProviderWithoutWebHIDProvider = ({
    children,
    derivationPath,
    init,
}: PropsWithChildren<QubicLedgerAppProviderProps>) => {
    const ctx = useContext(LedgerWebHIDContext);

    const [app, setApp] = useState<HWAppQubic | null>(null);
    const [generatedAddresses, setGeneratedAddresses] = useState<IQubicLedgerAddress[]>([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);

    const selectedAddress = useMemo(() => {
        if (selectedAddressIndex === null) {
            return null;
        }

        return generatedAddresses[selectedAddressIndex];
    }, [selectedAddressIndex, generatedAddresses]);

    const initApp = useCallback(async () => {
        if (!ctx) {
            throw new Error('WebHIDContext not initialized');
        }

        if (app) {
            throw new Error('Qubic HW App is already initialized');
        }

        const transportForHwAppQubic = ctx?.transport
            ? ctx.transport
            : await ctx.initLedgerTransportHandler();

        if (!transportForHwAppQubic) {
            throw new Error('Cannot get transport for initializing Qubic HW App');
        }

        const newApp = new HWAppQubic(transportForHwAppQubic);

        setApp(newApp);

        return newApp;
    }, [ctx, app]);

    const addNewAddress = useCallback(
        (generatedAddressData: IQubicLedgerAddress) => {
            setGeneratedAddresses((prev) => [...prev, generatedAddressData]);

            if (!selectedAddress) {
                setSelectedAddressIndex(0);
            }
        },
        [setGeneratedAddresses, selectedAddress],
    );

    const reset = useCallback(() => {
        setApp(null);
        setGeneratedAddresses([]);
        setSelectedAddressIndex(null);
    }, []);

    useEffect(() => {
        if (init && !app) {
            initApp();
        }
    }, [init, app, initApp]);

    return (
        <QubicLedgerAppContext.Provider
            value={{
                app,
                selectedAddress,
                generatedAddresses,
                derivationPath,
                initApp,
                addNewAddress,
                setSelectedAddressIndex,
                reset,
            }}
        >
            {children}
        </QubicLedgerAppContext.Provider>
    );
};

export const QubicLedgerAppProvider = ({
    children,
    init = true,
    derivationPath,
}: PropsWithChildren<QubicLedgerAppProviderProps>) => (
    <LedgerWebHIDProvider init={false}>
        <QubicLedgerAppProviderWithoutWebHIDProvider init={init} derivationPath={derivationPath}>
            {children}
        </QubicLedgerAppProviderWithoutWebHIDProvider>
    </LedgerWebHIDProvider>
);
