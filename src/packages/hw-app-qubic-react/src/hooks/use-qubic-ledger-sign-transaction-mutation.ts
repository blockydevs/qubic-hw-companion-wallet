import { QubicTransaction } from '@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction';
import { useMutation } from '@tanstack/react-query';
import { ICustomUseMutationOptions } from '../types';
import { useQubicLedgerApp } from './use-qubic-ledger-app';
import { ISignTransactionReturn } from '@blockydevs/qubic-hw-app';

interface UseQubicLedgerSignTransactionMutationProps {
    transaction: QubicTransaction;
    derivationPath: string;
}

export const useQubicLedgerSignTransactionMutation = (
    mutationOptions?: ICustomUseMutationOptions<
        ISignTransactionReturn,
        UseQubicLedgerSignTransactionMutationProps
    >,
) => {
    const { app } = useQubicLedgerApp();

    const signTransaction = async (variables: UseQubicLedgerSignTransactionMutationProps) => {
        if (!app) {
            throw new Error('Ledger app not initialized');
        }

        return await app.signTransaction(variables.derivationPath, variables.transaction);
    };

    return useMutation({
        mutationKey: ['ledgerBroadcastTransaction'],
        mutationFn: async (variables: UseQubicLedgerSignTransactionMutationProps) =>
            signTransaction(variables),
        ...mutationOptions,
    });
};
