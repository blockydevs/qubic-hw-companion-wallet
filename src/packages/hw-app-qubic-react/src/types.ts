import { UndefinedInitialDataOptions, UseMutationOptions } from '@tanstack/react-query';

export interface IQubicLedgerAddress {
    identity: string;
    publicKey: Buffer<ArrayBufferLike>;
    addressDerivationPath: string;
    addressIndex: number;
    balance: string;
}

export interface IQubicBalanceDTO {
    balance: {
        id: string;
        balance: string;
        validForTick: number;
        latestIncomingTransferTick: number;
        latestOutgoingTransferTick: number;
        incomingAmount: string;
        outgoingAmount: string;
        numberOfIncomingTransfers: number;
        numberOfOutgoingTransfers: number;
    };
}

export interface IQubicLatestTickDTO {
    latestTick: number;
}

export interface IQubicTransactionDTO {}

export interface IQubicTransactionsDTO {}

export interface IQubicBroadcastedTransactionDTO {
    encodedTransaction: string;
    peersBroadcasted: number;
    transactionId: string;
}

export interface ICustomUseQueryOptions<Data>
    extends Omit<
        UndefinedInitialDataOptions<Data, Error, Data, string[]>,
        'queryKey' | 'queryFn'
    > {}

export interface ICustomUseMutationOptions<ReturnData, Variables = void>
    extends Omit<
        UseMutationOptions<ReturnData, Error, Variables, string[]>,
        'mutationFn' | 'mutationKey'
    > {}

export interface IHttpClient {
    request<Return>(url: string, requestOptions?: RequestInit): Promise<Return>;
}

export interface IDataValidator<Return> {
    validate(data: unknown): Return;
}

export interface IDataTransformer<Data, Return = Data> {
    transform(data: Data): Return;
}
