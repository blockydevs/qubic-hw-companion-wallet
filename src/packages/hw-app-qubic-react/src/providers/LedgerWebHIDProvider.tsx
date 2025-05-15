import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import type { ITransportListenersConfigProps } from '../types';
import { createTransportListeners } from '../utils/transport-listeners';
import { checkIfQubicAppIsOpenOnLedger } from '@/routes/home/page.utils';

interface ILedgerWebHIDContext {
    transport: Transport | null;
    initLedgerTransportHandler: (
        listenersConfig?: ITransportListenersConfigProps,
    ) => Promise<Transport | null>;
    resetTransport: () => Promise<void>;
}

export interface LedgerWebHIDProviderProps {
    init?: boolean;
}

export const LedgerWebHIDContext = createContext<ILedgerWebHIDContext | null>(null);

export const LedgerWebHIDProvider = ({
    children,
    init = true,
}: PropsWithChildren<LedgerWebHIDProviderProps>) => {
    const [transport, setTransport] = useState<Transport | null>(null);
    const isInitialized = useRef(false);

    const initLedgerTransportHandler = useCallback(
        async (listenersConfig?: ITransportListenersConfigProps) => {
            if (transport) {
                throw new Error('Transporter already initialized');
            }

            let transporterWebHIDInstance: Transport | null = null;

            try {
                transporterWebHIDInstance = await TransportWebHID.create();

                const isOpenQubicAppOnLedger = await checkIfQubicAppIsOpenOnLedger(
                    transporterWebHIDInstance,
                );

                if (!isOpenQubicAppOnLedger) {
                    await transporterWebHIDInstance.close();
                }

                if (listenersConfig) {
                    createTransportListeners(transporterWebHIDInstance, listenersConfig);
                }

                setTransport(transporterWebHIDInstance);

                return transporterWebHIDInstance;
            } catch (error) {
                transporterWebHIDInstance?.close();

                throw error;
            }
        },
        [transport],
    );

    const checkIfQubicAppIsOpenOnLedgerHandler = useCallback(async (transport: Transport) => {
        try {
            return await checkIfQubicAppIsOpenOnLedger(transport);
        } catch {
            return false;
        }
    }, []);

    const resetTransport = useCallback(async () => {
        if (transport) {
            try {
                if (checkIfQubicAppIsOpenOnLedgerHandler(transport)) {
                    await transport.close();
                }
            } catch {
                // #FIXME: the "checkIfQubicAppIsOpenOnLedgerHandler" throw error instead of returning false
                return;
            }
        }

        setTransport(null);
    }, [transport]);

    useEffect(() => {
        if (init && !transport && !isInitialized.current) {
            isInitialized.current = true;
            initLedgerTransportHandler();
        }
    }, [init, transport, initLedgerTransportHandler]);

    const contextValues = useMemo(
        () => ({ transport, resetTransport, initLedgerTransportHandler }),
        [transport, resetTransport, initLedgerTransportHandler],
    );

    return (
        <LedgerWebHIDContext.Provider value={contextValues}>
            {children}
        </LedgerWebHIDContext.Provider>
    );
};
