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

export const transactionDetailsSchema = z.object({
    sourceId: z.string(),
    destId: z.string(),
    amount: z.string(),
    tickNumber: z.number(),
    inputType: z.number(),
    inputSize: z.number(),
    inputHex: z.string(),
    signatureHex: z.string(),
    txId: z.string(),
});

export const transactionDataSchema = z.object({
    transaction: transactionDetailsSchema,
    timestamp: z.string(),
    moneyFlew: z.boolean(),
});

export const transactionSchema = z.object({
    tickNumber: z.number(),
    identity: z.string(),
    transactions: z.array(transactionDataSchema),
});

export const qubicTransactionsSchema = z.object({
    transactions: z.array(transactionSchema),
});

export const qubicBroadcastedTransactionResult = z.object({
    encodedTransaction: z.string(),
    peersBroadcasted: z.number(),
    transactionId: z.string(),
});

export const qubicPendingTransactionSchema = z.object({
    txId: z.string(),
    status: z.enum(['pending', 'success', 'failed']),
    amount: z.number(),
    to: z.string(),
    tick: z.number(),
    createdAtTick: z.number(),
    from: z.string(),
});

const transactionForIdentitySchema = z.object({
    hash: z.string(),
    amount: z.string(),
    source: z.string(),
    destination: z.string(),
    tickNumber: z.number(),
    timestamp: z.string(),
    inputType: z.number(),
    inputSize: z.number(),
    inputData: z.string(),
    signature: z.string(),
    moneyFlew: z.boolean(),
});

export const transactionsForIdentitySchema = z.object({
    validForTick: z.number(),
    hits: z.object({
        total: z.number(),
        from: z.number(),
        size: z.number(),
    }),
    transactions: z.array(transactionForIdentitySchema),
});
