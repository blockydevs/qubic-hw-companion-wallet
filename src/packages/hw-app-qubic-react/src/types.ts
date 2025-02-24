export interface IQubicLedgerAddress {
    identity: string;
    publicKey: string;
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
