import type { PropsWithChildren } from 'react';
import React, { createContext } from 'react';
import { QubicRpcService } from '../services/qubic-rpc';

export const QubicRpcServiceContext = createContext<QubicRpcService | null>(null);

export const QubicRpcServiceProvider = ({
    children,
    rpcUrl,
}: PropsWithChildren<{ rpcUrl: string }>) => (
    <QubicRpcServiceContext.Provider value={new QubicRpcService(rpcUrl)}>
        {children}
    </QubicRpcServiceContext.Provider>
);
