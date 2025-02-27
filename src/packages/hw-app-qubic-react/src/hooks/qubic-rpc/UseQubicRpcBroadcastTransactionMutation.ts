import { useMutation } from '@tanstack/react-query';
import { QubicRpcService } from '../../services/qubic-rpc';
import type { ICustomUseMutationOptions, IQubicBroadcastedTransactionDTO } from '../../types';
import { useId } from 'react';
import { QubicTransaction } from '@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction';

export const useQubicRpcBroadcastTransactionMutation = (
    mutationOptions?: ICustomUseMutationOptions<
        IQubicBroadcastedTransactionDTO,
        QubicTransaction | string
    >,
) => {
    const id = useId();

    return useMutation({
        mutationKey: ['qubicBroadcastTransaction', id],
        mutationFn: async (transaction: QubicTransaction | string) =>
            await QubicRpcService.broadcastTransaction(transaction),
        ...mutationOptions,
    });
};
