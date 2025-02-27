import { DEFAULT_TICK_INTERVAL_FOR_TRANSACTIONS, QUBIC_RPC_URL } from '../constants';
import type { IQubicBroadcastedTransactionDTO } from '../types';
import type { IFetcherArgs } from '../utils/fetcher';
import { fetcher } from '../utils/fetcher';
import {
    qubicBalanceSchema,
    qubicBroadcastedTransactionResult,
    qubicLatestTickSchema,
    qubicTransactionsSchema,
} from '../utils/validation-schemas';
import { QubicTransaction } from '@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction';

interface IQubicRpcFetcherArgs<Data, Return = Data>
    extends Omit<IFetcherArgs<Data, Return>, 'url'> {
    endpoint: string;
}

const qubicRpcFetcher = async <Data, Return = Data>({
    endpoint,
    ...rest
}: IQubicRpcFetcherArgs<Data, Return>) =>
    await fetcher({
        url: `${QUBIC_RPC_URL}${endpoint}`,
        ...rest,
    });

const getBalance = async (identity: string) =>
    await qubicRpcFetcher({
        endpoint: `v1/balances/${identity}`,
        validation: {
            schema: qubicBalanceSchema,
            errorMessage: `Invalid balance response data for ${identity} address.`,
        },
        transformResponse: (data) => data.balance,
    });

const getCurrentTick = async () =>
    await qubicRpcFetcher({
        endpoint: 'v1/latestTick',
        validation: {
            schema: qubicLatestTickSchema,
            errorMessage: 'Invalid latest tick response data.',
        },
        transformResponse: (data) => data.latestTick,
    });

const getTransactions = async ({
    identity,
    startTick,
    endTick = startTick + DEFAULT_TICK_INTERVAL_FOR_TRANSACTIONS,
}: {
    identity: string;
    startTick: number;
    endTick?: number;
}) =>
    await qubicRpcFetcher({
        endpoint: `v2/identities/${identity}/transfers?startTick=${startTick}&endTick=${endTick}`,
        validation: {
            schema: qubicTransactionsSchema,
            errorMessage: `Invalid transactions response data for ${identity} address.`,
        },
    });

const broadcastTransaction = async (
    transaction: QubicTransaction | string,
): Promise<IQubicBroadcastedTransactionDTO> =>
    await qubicRpcFetcher({
        endpoint: 'v1/broadcast-transaction',
        requestOptions: {
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
        },
        validation: {
            schema: qubicBroadcastedTransactionResult,
            errorMessage: 'Failed to broadcast transaction.',
        },
    });

export const QubicRpcService = {
    getBalance,
    getCurrentTick,
    getTransactions,
    broadcastTransaction,
};
