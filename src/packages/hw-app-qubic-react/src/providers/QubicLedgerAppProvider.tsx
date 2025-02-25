import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { HWAppQubic } from '../../../hw-app-qubic';
import { LedgerWebHIDContext, LedgerWebHIDProvider } from './LedgerWebHIDProvider';
import type { IQubicLedgerAddress } from '../types';
import { getBalance } from '../utils/rpc';

export interface IQubicLedgerAppContext {
    app: HWAppQubic | null;
    selectedAddress: IQubicLedgerAddress | null;
    generatedAddresses: IQubicLedgerAddress[];
    areBalanceLoading: boolean;
    derivationPath: string;
    initApp: () => Promise<HWAppQubic>;
    addNewAddress: (generatedAddressData: IQubicLedgerAddress) => void;
    refetchBalances: () => Promise<void>;
    setSelectedAddressIndex: (index: number) => void;
    reset: () => Promise<void>;
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
    const [areBalanceLoading, setAreBalanceLoading] = useState(false);

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

    const refetchBalances = useCallback(async () => {
        if (!app) {
            throw new Error('QubicLedgerApp not initialized');
        }

        if (areBalanceLoading) {
            return;
        }

        setAreBalanceLoading(true);

        const updatedAddresses = await Promise.all(
            generatedAddresses.map(async (address) => {
                try {
                    const balanceResponse = await getBalance(address.identity);

                    return {
                        ...address,
                        balance: balanceResponse?.balance ?? '0',
                    };
                } catch {
                    return address;
                }
            }),
        );

        setGeneratedAddresses(updatedAddresses);
        setAreBalanceLoading(false);
    }, [app, generatedAddresses, areBalanceLoading]);

    const reset = useCallback(async () => {
        ctx?.resetTransport();
        setApp(null);
        setGeneratedAddresses([]);
        setSelectedAddressIndex(null);
    }, [app, ctx, setApp]);

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
                areBalanceLoading,
                initApp,
                addNewAddress,
                refetchBalances,
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
