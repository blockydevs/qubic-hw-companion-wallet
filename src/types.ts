export type DeviceType = 'usb' | 'bluetooth' | 'demo';

export interface ILocaleSeparators {
    decimalSeparator: string;
    groupSeparator: string;
}

export type QubicTransactionStatus = 'pending' | 'success' | 'failed' | 'unknown';

export interface IQubicPendingTransaction {
    to: string;
    amount: number;
    txId: string;
    status: QubicTransactionStatus;
    tick: number;
    createdAtTick: number;
}
