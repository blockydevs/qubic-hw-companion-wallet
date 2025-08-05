import type { IQubicBroadcastedTransactionDTO } from '../types';
import { Fetcher } from '../utils/fetcher';
import {
    qubicBalanceSchema,
    qubicBroadcastedTransactionResult,
    qubicLatestTickSchema,
    transactionDataSchema,
    transactionsForIdentitySchema,
} from '../utils/validation-schemas';
import { QubicTransaction } from '@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction';

export class QubicRpcService {
    constructor(public rpcUrl: string, public apiUrl: string) {
        this.rpcUrl = rpcUrl;
        this.apiUrl = apiUrl;
    }

    async getBalance(identity: string) {
        return await Fetcher.create({
            schema: qubicBalanceSchema,
            errorMessage: `Invalid balance response data for ${identity} address.`,
            transformResponse: (data) => data.balance,
        }).fetch(`${this.rpcUrl}v1/balances/${identity}`);
    }

    async getCurrentTick() {
        return await Fetcher.create({
            schema: qubicLatestTickSchema,
            errorMessage: 'Invalid latest tick response data.',
            transformResponse: (data) => data.latestTick,
        }).fetch(`${this.rpcUrl}v1/latestTick`);
    }

    async getTransaction({ transactionId }: { transactionId: string }) {
        return await Fetcher.create({
            schema: transactionDataSchema,
            errorMessage: `Invalid transactions response data for ${transactionId} transaction.`,
        }).fetch(`${this.rpcUrl}v2/transactions/${transactionId}`);
    }

    async getTransactionsForIdentity({
        identity,
        offset = 0,
        size = 50,
    }: {
        identity: string;
        offset?: number;
        size?: number;
    }) {
        return await Fetcher.create({
            schema: transactionsForIdentitySchema,
            errorMessage: `Invalid transactions response data for ${identity} identity.`,
        }).fetch(`${this.apiUrl}getTransactionsForIdentity`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identity,
                pagination: {
                    offset,
                    size,
                },
            }),
        });
    }

    async broadcastTransaction(
        transaction: QubicTransaction | string,
    ): Promise<IQubicBroadcastedTransactionDTO> {
        return await Fetcher.create({
            schema: qubicBroadcastedTransactionResult,
            errorMessage: 'Failed to broadcast transaction.',
            transformResponse: (data) => ({
                encodedTransaction: data.encodedTransaction,
                peersBroadcasted: data.peersBroadcasted,
                transactionId: data.transactionId,
            }),
        }).fetch(`${this.rpcUrl}v1/broadcast-transaction`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                encodedTransaction:
                    typeof transaction === 'string'
                        ? transaction
                        : transaction.encodeTransactionToBase64(transaction.getPackageData()),
            }),
        });
    }
}
