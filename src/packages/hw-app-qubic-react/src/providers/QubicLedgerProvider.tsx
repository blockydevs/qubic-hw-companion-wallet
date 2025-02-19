import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HWAppQubic } from '../../../hw-app-qubic';
import { LedgerWebHIDContext, LedgerWebHIDProvider } from './LedgerWebHIDProvider';
import type { IQubicLedgerAddress } from '../types';

export interface IQubicLedgerContext {
    app: HWAppQubic | null;
    selectedAddress: IQubicLedgerAddress | null;
    generatedAddresses: IQubicLedgerAddress[];
    derivationPath: string;
    initApp: () => Promise<HWAppQubic>;
    addNewAddress: (generatedAddressData: IQubicLedgerAddress) => void;
    setSelectedAddressIndex: (index: number) => void;
}

export const QubicLedgerContext = createContext<IQubicLedgerContext | null>(null);

interface QubicLedgerProviderProps {
    init?: boolean;
    derivationPath: string;
}

const QubicLedgerProviderWithoutWebHIDProvider = ({
    children,
    derivationPath,
    init,
}: PropsWithChildren<QubicLedgerProviderProps>) => {
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

    useEffect(() => {
        if (init && !app) {
            initApp();
        }
    }, [init, app, initApp]);

    return (
        <QubicLedgerContext.Provider
            value={{
                app,
                selectedAddress,
                generatedAddresses,
                derivationPath,
                initApp,
                addNewAddress,
                setSelectedAddressIndex,
            }}
        >
            {children}
        </QubicLedgerContext.Provider>
    );
};

export const QubicLedgerProvider = ({
    children,
    init = true,
    derivationPath,
}: PropsWithChildren<QubicLedgerProviderProps>) => (
    <LedgerWebHIDProvider init={false}>
        <QubicLedgerProviderWithoutWebHIDProvider init={init} derivationPath={derivationPath}>
            {children}
        </QubicLedgerProviderWithoutWebHIDProvider>
    </LedgerWebHIDProvider>
);
