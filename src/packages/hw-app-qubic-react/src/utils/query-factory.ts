import { QubicRpcService } from '../services/qubic-rpc';

export const createQubicRpcQueryFactory = (rpcUrl: string, apiUrl: string) => {
    const qubicRpcService = new QubicRpcService(rpcUrl, apiUrl);

    return {
        getTransactions: {
            forIdentity: (options: { identity: string; offset?: number; size?: number }) => ({
                queryKey: ['qubicTransactionHistory', options],
                queryFn: async () => {
                    return qubicRpcService.getTransactionsForIdentity(options);
                },
            }),
        },

        currentTick: (options: { refreshInterval?: number }) => ({
            queryKey: ['qubicCurrentTick'],
            queryFn: async () => await qubicRpcService.getCurrentTick(),
            refetchInterval: options.refreshInterval || 10000,
        }),
    };
};
