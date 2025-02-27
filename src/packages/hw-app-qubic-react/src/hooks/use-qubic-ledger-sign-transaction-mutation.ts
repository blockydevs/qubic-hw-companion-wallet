import { useId } from 'react';
import { QubicTransaction } from '@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction';
import type { ISignTransactionReturn } from '@/packages/hw-app-qubic';
import { useMutation } from '@tanstack/react-query';
import { ICustomUseMutationOptions } from '../types';
import { useQubicLedgerApp } from './use-qubic-ledger-app';

export const useQubicLedgerSignTransactionMutation = (
    mutationOptions?: ICustomUseMutationOptions<ISignTransactionReturn, QubicTransaction>,
) => {
    const id = useId();
    const { app } = useQubicLedgerApp();

    const broadcastTransaction = async (transaction: QubicTransaction) => {
        if (!app) {
            throw new Error('Ledger app not initialized');
        }

        return await app.signTransaction(transaction);
    };

    return useMutation({
        mutationKey: ['ledgerBroadcastTransaction', id],
        mutationFn: async (transaction: QubicTransaction) => broadcastTransaction(transaction),
        ...mutationOptions,
    });
};
