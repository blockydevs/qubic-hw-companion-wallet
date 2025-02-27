import { createContext, useCallback, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';

interface ILedgerWebHIDContext {
    transport: Transport | null;
    initLedgerTransportHandler: () => Promise<Transport | null>;
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

    const initLedgerTransportHandler = useCallback(async () => {
        if (transport) {
            throw new Error('Transporter already initialized');
        }

        const transporterWebHIDInstance = await TransportWebHID.create();

        setTransport(transporterWebHIDInstance);

        return transporterWebHIDInstance;
    }, [transport]);

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

    return (
        <LedgerWebHIDContext.Provider
            value={{ transport, resetTransport, initLedgerTransportHandler }}
        >
            {children}
        </LedgerWebHIDContext.Provider>
    );
};
