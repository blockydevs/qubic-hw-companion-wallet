import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useConnectToQubicLedgerApp } from '@/hooks/qubic-ledger-app';

interface IReconnectUserLedgerQubicAppContext {
    isReconnecting: boolean;
    isReconnectingInitialized: boolean;
}

export const ReconnectUserLedgerQubicAppContext =
    createContext<IReconnectUserLedgerQubicAppContext>(null);

export const ReconnectUserLedgerQubicAppProvider = ({ children }: PropsWithChildren) => {
    const isInitialized = useRef(false);
    const { handleConnectWithUsb } = useConnectToQubicLedgerApp();
    const [isReconnecting, setIsReconnecting] = useState(false);

    const tryToReconnectIfAnyWebHIDDeviceIsConnected = useCallback(async () => {
        setIsReconnecting(true);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const activeDevices = await (navigator as any).hid.getDevices();

        if (!activeDevices.length) {
            return;
        }

        await handleConnectWithUsb();
        setIsReconnecting(false);
    }, [handleConnectWithUsb]);

    useEffect(() => {
        if (isInitialized.current || isReconnecting) {
            return;
        }

        isInitialized.current = true;

        tryToReconnectIfAnyWebHIDDeviceIsConnected();
    }, [tryToReconnectIfAnyWebHIDDeviceIsConnected, isReconnecting]);

    return (
        <ReconnectUserLedgerQubicAppContext
            value={{ isReconnecting, isReconnectingInitialized: isInitialized.current }}
        >
            {children}
        </ReconnectUserLedgerQubicAppContext>
    );
};
