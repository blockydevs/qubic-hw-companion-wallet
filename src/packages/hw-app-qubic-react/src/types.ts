import {
    InfiniteData,
    UndefinedInitialDataInfiniteOptions,
    UndefinedInitialDataOptions,
    UseMutationOptions,
} from '@tanstack/react-query';

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

export interface IQubicTransactionDetailsDTO {
    sourceId: string;
    destId: string;
    amount: string;
    tickNumber: number;
    inputType: number;
    inputSize: number;
    inputHex: string;
    signatureHex: string;
    txId: string;
}

export interface IQubicTransactionDataDTO {
    transaction: IQubicTransactionDetailsDTO;
    timestamp: string;
    moneyFlew: boolean;
}

export interface IQubicTransactionDTO {
    tickNumber: number;
    identity: string;
    transactions: IQubicTransactionDataDTO[];
}

export interface IQubicTransactionsDTO {
    transactions: IQubicTransactionDTO[];
}

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

export interface ICustomUseInfiniteQueryOptions<Data>
    extends Omit<
        UndefinedInitialDataInfiniteOptions<
            Data,
            Error,
            InfiniteData<Data, unknown>,
            string[],
            number
        >,
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

export interface ITransportListenersConfigProps {
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
}

export type QubicTransactionStatus = 'pending' | 'success' | 'failed' | 'unknown';

export interface IQubicPendingTransaction {
    to: string;
    amount: number;
    txId: string;
    status: QubicTransactionStatus;
    tick: number;
    createdAtTick: number;
    from: string;
}
