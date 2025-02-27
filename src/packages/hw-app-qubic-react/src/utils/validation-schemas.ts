import { z } from 'zod';

export const qubicBalanceSchema = z.object({
    balance: z.object({
        id: z.string(),
        balance: z.string(),
        validForTick: z.number(),
        latestIncomingTransferTick: z.number(),
        latestOutgoingTransferTick: z.number(),
        incomingAmount: z.string(),
        outgoingAmount: z.string(),
        numberOfIncomingTransfers: z.number(),
        numberOfOutgoingTransfers: z.number(),
    }),
});

export const qubicLatestTickSchema = z.object({
    latestTick: z.number(),
});

export const qubicTransactionsSchema = z.array(z.any());

export const qubicBroadcastedTransactionResult = z.object({
    encodedTransaction: z.string(),
    peersBroadcasted: z.number(),
    transactionId: z.string(),
});
