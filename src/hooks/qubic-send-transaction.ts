import { useCallback } from 'react';
import qubic from '@qubic-lib/qubic-ts-library';
import {
    encodeTransactionToBase64,
    useQubicLedgerSignTransactionMutation,
    useQubicRpcBroadcastTransactionMutation,
} from '@/packages/hw-app-qubic-react';
import { useMutation } from '@tanstack/react-query';
import { ICustomUseMutationOptions } from '@/packages/hw-app-qubic-react/src/types';

interface QubicSendTransactionSignedWithLedgerToRpcParameters {
    sourceIdentity: string;
    destinationIdentity: string;
    amount: number;
    tick: number;

    isDemoMode?: boolean;

    onBeforeSignTransactionWithLedger?: () => Promise<void> | void;
    onBeforeBroadcastTransactionToRpc?: () => Promise<void> | void;
    onAfterBroadcastTransactionToRpc?: (sentTransactionData: {
        from: string;
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
    derivationPath: string,
    latestTick: number,
    mutationOptions?: ICustomUseMutationOptions<
        void,
        QubicSendTransactionSignedWithLedgerToRpcParameters
    >,
) => {
    const { mutateAsync: ledgerSignTransaction } = useQubicLedgerSignTransactionMutation();
    const { mutateAsync: broadcastTransactionToRpc } = useQubicRpcBroadcastTransactionMutation();

    const handleBroadcastTransaction = useCallback(
        async ({
            destinationIdentity,
            sourceIdentity,
            amount,
            tick,
            onAfterBroadcastTransactionToRpc,
            onBeforeBroadcastTransactionToRpc,
            onBeforeSignTransactionWithLedger,
        }: QubicSendTransactionSignedWithLedgerToRpcParameters) => {
            if (!latestTick) {
                throw new Error('No latest tick info');
            }

            const sourcePublicKey = new qubic.PublicKey(sourceIdentity);
            const destinationPublicKey = new qubic.PublicKey(destinationIdentity);

            const qubicTransaction = new qubic.QubicTransaction()
                .setSourcePublicKey(sourcePublicKey)
                .setDestinationPublicKey(destinationPublicKey)
                .setAmount(amount)
                .setTick(tick);

            await onBeforeSignTransactionWithLedger?.();

            const { signedData } = await ledgerSignTransaction({
                transaction: qubicTransaction,
                derivationPath,
            });

            const encodedTransaction = encodeTransactionToBase64(signedData);

            await onBeforeBroadcastTransactionToRpc?.();

            const { transactionId } = await broadcastTransactionToRpc(encodedTransaction);

            await onAfterBroadcastTransactionToRpc({
                sentTo: destinationIdentity,
                sentTxId: transactionId,
                sentAmount: amount,
                from: sourceIdentity,
            });
        },
        [broadcastTransactionToRpc, derivationPath, latestTick, ledgerSignTransaction],
    );

    const handleDemoTransaction = useCallback(
        async ({
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
                        from: 'demo-transaction-from',
                    });

                    resolve(void 0);
                }, 3000);
            });
        },
        [],
    );

    const sendTransactionSignedWithLedgerToRpc = useCallback(
        async (values: QubicSendTransactionSignedWithLedgerToRpcParameters) =>
            values?.isDemoMode
                ? await handleDemoTransaction(values)
                : await handleBroadcastTransaction(values),
        [handleBroadcastTransaction, handleDemoTransaction],
    );

    return useMutation({
        mutationKey: ['sendTransactionSignedWithLedgerToRpc'],
        mutationFn: sendTransactionSignedWithLedgerToRpc,
        ...mutationOptions,
    });
};
