import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LedgerWebHIDContext, LedgerWebHIDProvider } from './LedgerWebHIDProvider';
import type { IQubicLedgerAddress, ITransportListenersConfigProps } from '../types';
import { QubicRpcServiceContext, QubicRpcServiceProvider } from './QubicRpcServiceProvider';
import { HWAppQubic } from 'qubic-hw-app/src/hw-app-qubic';

export interface IQubicLedgerAppContext {
    app: HWAppQubic | null;
    selectedAddress: IQubicLedgerAddress | null;
    generatedAddresses: IQubicLedgerAddress[];
    areBalanceLoading: boolean;
    derivationPath: string;
    transactionTickOffset: number;
    initApp: (listenersConfig?: ITransportListenersConfigProps) => Promise<HWAppQubic>;
    addNewAddress: (generatedAddressData: IQubicLedgerAddress) => void;
    refetchBalances: () => Promise<void>;
    setSelectedAddressIndex: (index: number) => void;
    reset: () => Promise<void>;
}

export const QubicLedgerAppContext = createContext<IQubicLedgerAppContext | null>(null);

interface QubicLedgerAppProviderProps {
    init?: boolean;
    derivationPath: string;
    transactionTickOffset: number;
    rpcUrl: string;
}

const QubicLedgerAppProviderWithoutWebHIDProvider = ({
    children,
    derivationPath,
    transactionTickOffset,
    init,
}: PropsWithChildren<Omit<QubicLedgerAppProviderProps, 'rpcUrl'>>) => {
    const ledgerWebHIDContext = useContext(LedgerWebHIDContext);
    const qubicRpcService = useContext(QubicRpcServiceContext);

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

    const initApp = useCallback(
        async (listenersConfig?: ITransportListenersConfigProps) => {
            if (!ledgerWebHIDContext) {
                throw new Error('LedgerWebHIDContext not initialized');
            }

            if (app) {
                throw new Error('Qubic HW App is already initialized');
            }

            const transportForHwAppQubic = ledgerWebHIDContext?.transport
                ? ledgerWebHIDContext.transport
                : await ledgerWebHIDContext.initLedgerTransportHandler({
                      onDisconnect: () => {
                          setApp(null);
                          ledgerWebHIDContext.resetTransport();

                          listenersConfig?.onDisconnect?.();
                      },
                  });

            if (!transportForHwAppQubic) {
                throw new Error('Cannot get transport for initializing Qubic HW App');
            }

            const newApp = new HWAppQubic(transportForHwAppQubic);

            setApp(newApp);

            return newApp;
        },
        [ledgerWebHIDContext, app],
    );

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
                    const balanceResponse = await qubicRpcService.getBalance(address.identity);

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
        await ledgerWebHIDContext?.resetTransport();
        setApp(null);
        setGeneratedAddresses([]);
        setSelectedAddressIndex(null);
    }, [app, ledgerWebHIDContext, setApp]);

    useEffect(() => {
        if (init && !app) {
            initApp();
        }
    }, [init, app, initApp]);

    const contextValues = useMemo(
        () => ({
            app,
            selectedAddress,
            generatedAddresses,
            derivationPath,
            areBalanceLoading,
            initApp,
            addNewAddress,
            transactionTickOffset,
            refetchBalances,
            setSelectedAddressIndex,
            reset,
        }),
        [
            app,
            selectedAddress,
            generatedAddresses,
            derivationPath,
            areBalanceLoading,
            initApp,
            addNewAddress,
            transactionTickOffset,
            refetchBalances,
            setSelectedAddressIndex,
            reset,
        ],
    );

    return (
        <QubicLedgerAppContext.Provider value={contextValues}>
            {children}
        </QubicLedgerAppContext.Provider>
    );
};

export const QubicLedgerAppProvider = ({
    children,
    init = true,
    derivationPath,
    transactionTickOffset,
    rpcUrl,
}: PropsWithChildren<QubicLedgerAppProviderProps>) => (
    <LedgerWebHIDProvider init={false}>
        <QubicRpcServiceProvider rpcUrl={rpcUrl}>
            <QubicLedgerAppProviderWithoutWebHIDProvider
                init={init}
                transactionTickOffset={transactionTickOffset}
                derivationPath={derivationPath}
            >
                {children}
            </QubicLedgerAppProviderWithoutWebHIDProvider>
        </QubicRpcServiceProvider>
    </LedgerWebHIDProvider>
);
