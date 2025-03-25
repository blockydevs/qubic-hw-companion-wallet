import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import type { ITransportListenersConfigProps } from '../types';
import { createTransportListeners } from '../utils/transport-listeners';

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

    const initLedgerTransportHandler = useCallback(
        async (listenersConfig?: ITransportListenersConfigProps) => {
            if (transport) {
                throw new Error('Transporter already initialized');
            }

            const transporterWebHIDInstance = await TransportWebHID.create();

            if (listenersConfig) {
                createTransportListeners(transporterWebHIDInstance, listenersConfig);
            }

            setTransport(transporterWebHIDInstance);

            return transporterWebHIDInstance;
        },
        [transport],
    );

    const resetTransport = useCallback(async () => {
        if (transport) {
            await transport.close();
            setTransport(null);
        }
    }, [transport]);

    useEffect(() => {
        if (init && !transport) {
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
