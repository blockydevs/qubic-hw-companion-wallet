import { useMutation } from '@tanstack/react-query';
import type { ICustomUseMutationOptions, IQubicBroadcastedTransactionDTO } from '../../types';
import { QubicTransaction } from '@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction';
import { useQubicRpcService } from './use-qubic-rpc-service';

export const useQubicRpcBroadcastTransactionMutation = (
    mutationOptions?: ICustomUseMutationOptions<
        IQubicBroadcastedTransactionDTO,
        QubicTransaction | string
    >,
) => {
    const qubicRpcService = useQubicRpcService();

    return useMutation({
        mutationKey: ['qubicBroadcastTransaction'],
        mutationFn: async (transaction: QubicTransaction | string) =>
            await qubicRpcService.broadcastTransaction(transaction),
        ...mutationOptions,
    });
};
