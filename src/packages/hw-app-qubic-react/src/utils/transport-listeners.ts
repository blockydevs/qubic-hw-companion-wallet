import type Transport from '@ledgerhq/hw-transport';
import type { ITransportListenersConfigProps } from '../types';

export const createTransportListeners = (
    transport: Transport,
    listenersConfig?: ITransportListenersConfigProps,
) => {
    if (listenersConfig?.onDisconnect) {
        transport.on('disconnect', listenersConfig.onDisconnect);
    }
};
