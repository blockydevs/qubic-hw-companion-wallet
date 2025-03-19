import { use } from 'react';
import { QubicRpcServiceContext } from '../../providers/QubicRpcServiceProvider';

export const useQubicRpcService = () => {
    const qubicRpcService = use(QubicRpcServiceContext);

    if (!qubicRpcService) {
        throw new Error('QubicRpcServiceContext not initialized');
    }

    return qubicRpcService;
};
