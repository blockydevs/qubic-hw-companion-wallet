import { useCallback, useId } from 'react';
import qubic from '@qubic-lib/qubic-ts-library';
import {
    encodeTransactionToBase64,
    useQubicLedgerSignTransactionMutation,
    useQubicRpcBroadcastTransactionMutation,
} from '@/packages/hw-app-qubic-react';
import { useMutation } from '@tanstack/react-query';
import type { ICustomUseMutationOptions } from '@/packages/hw-app-qubic-react/src/types';

interface QubicSendTransactionSignedWithLedgerToRpcParameters {
    sourceIdentity: string;
    destinationIdentity: string;
    amount: number;
    tick: number;

    isDemoMode?: boolean;

    onBeforeCreateTransaction?: () => Promise<void> | void;
    onBeforeSignTransactionWithLedger?: () => Promise<void> | void;
    onBeforeBroadcastTransactionToRpc?: () => Promise<void> | void;
    onAfterBroadcastTransactionToRpc?: (sentTransactionData: {
        sentTo: string;
        sentTxId: string;
        sentAmount: number;
    }) => Promise<void> | void;
}

interface QubicSendTransactionDemoParameters
    extends Pick<
        QubicSendTransactionSignedWithLedgerToRpcParameters,
        'onBeforeBroadcastTransactionToRpc' | 'onAfterBroadcastTransactionToRpc'
    > {}

export const useQubicSendTransactionSignedWithLedgerToRpc = (
    latestTick: number,
    mutationOptions?: ICustomUseMutationOptions<
        void,
        QubicSendTransactionSignedWithLedgerToRpcParameters
    >,
) => {
    const { mutateAsync: ledgerBroadcastTransaction } = useQubicLedgerSignTransactionMutation();
    const { mutateAsync: broadcastTransactionToRpc } = useQubicRpcBroadcastTransactionMutation();

    const handleBroadcastTransaction = useCallback(
        async ({
            destinationIdentity,
            sourceIdentity,
            amount,
            tick,
            onAfterBroadcastTransactionToRpc,
            onBeforeCreateTransaction,
            onBeforeBroadcastTransactionToRpc,
            onBeforeSignTransactionWithLedger,
        }: QubicSendTransactionSignedWithLedgerToRpcParameters) => {
            if (!latestTick) {
                throw new Error('No latest tick info');
            }

            await onBeforeCreateTransaction?.();

            const sourcePublicKey = new qubic.PublicKey(sourceIdentity);
            const destinationPublicKey = new qubic.PublicKey(destinationIdentity);

            const tx = new qubic.QubicTransaction()
                .setSourcePublicKey(sourcePublicKey)
                .setDestinationPublicKey(destinationPublicKey)
                .setAmount(amount)
                .setTick(tick);

            await onBeforeSignTransactionWithLedger?.();

            const { signedData } = await ledgerBroadcastTransaction(tx);

            const encodedTransaction = encodeTransactionToBase64(signedData);

            await onBeforeBroadcastTransactionToRpc?.();

            const { transactionId } = await broadcastTransactionToRpc(encodedTransaction);

            await onAfterBroadcastTransactionToRpc({
                sentTo: destinationIdentity,
                sentTxId: transactionId,
                sentAmount: amount,
            });
        },
        [ledgerBroadcastTransaction, latestTick],
    );

    const handleDemoTransaction = async ({
        onAfterBroadcastTransactionToRpc,
        onBeforeBroadcastTransactionToRpc,
    }: QubicSendTransactionDemoParameters) => {
        await onBeforeBroadcastTransactionToRpc?.();

        return new Promise<void>((resolve) => {
            setTimeout(async () => {
                await onAfterBroadcastTransactionToRpc({
                    sentTo: 'demo-transaction',
                    sentTxId: 'demo-transaction-id',
                    sentAmount: 100,
                });

                resolve(void 0);
            }, 3000);
        });
    };

    const sendTransactionSignedWithLedgerToRpc = useCallback(
        async (values: QubicSendTransactionSignedWithLedgerToRpcParameters) =>
            values?.isDemoMode
                ? await handleDemoTransaction(values)
                : await handleBroadcastTransaction(values),
        [handleBroadcastTransaction, handleDemoTransaction],
    );

    const id = useId();

    return useMutation({
        mutationKey: ['sendTransactionSignedWithLedgerToRpc', id],
        mutationFn: sendTransactionSignedWithLedgerToRpc,
        ...mutationOptions,
    });
};
