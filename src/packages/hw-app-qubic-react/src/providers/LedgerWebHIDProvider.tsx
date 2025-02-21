import React from 'react';
import type { PropsWithChildren } from 'react';
import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { notifications } from '@mantine/notifications';
import { createContext, useCallback, useEffect, useState } from 'react';

interface ILedgerWebHIDContext {
    transport: Transport | null;
    initLedgerTransportHandler: () => Promise<Transport | null>;
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
        try {
            if (transport) {
                throw new Error('Transporter already initialized');
            }

            const transporterWebHIDInstance = await TransportWebHID.create();

            setTransport(transporterWebHIDInstance);

            return transporterWebHIDInstance;
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: error instanceof Error ? error.message : 'Unknown error',
                color: 'red',
            });

            return null;
        }
    }, []);

    useEffect(() => {
        if (init && !transport) {
            initLedgerTransportHandler();
        }
    }, [init, transport, initLedgerTransportHandler]);

    return (
        <LedgerWebHIDContext.Provider value={{ transport, initLedgerTransportHandler }}>
            {children}
        </LedgerWebHIDContext.Provider>
    );
};
