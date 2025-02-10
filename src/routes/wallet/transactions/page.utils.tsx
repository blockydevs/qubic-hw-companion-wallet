import { format } from 'date-fns';
import { fetchTransactions } from '../../../lib/ledger';
import { TRANSACTIONS_PAGE_SIZE } from '../../../constants';
import type { ISelectedAddress } from '@/src/types';
import type { IMempoolEntry } from '@/src/lib/kaspa-rpc/kaspa';

export const loadAddressTransactions = async (
    selectedAddress: ISelectedAddress,
    setTransactions: (txs: any) => void,
    page = 1,
    count = 0,
) => {
    if (!selectedAddress) {
        setTransactions([]);
        return;
    }

    const maxPages = Math.ceil(count / TRANSACTIONS_PAGE_SIZE);
    const offset = Math.min(maxPages, page - 1) * TRANSACTIONS_PAGE_SIZE;
    const limit = page * TRANSACTIONS_PAGE_SIZE;

    const txsData = await fetchTransactions(selectedAddress.address, offset, limit);

    const processedTxData = txsData.map((tx) => {
        const myInputSum = tx.inputs.reduce((prev, curr) => {
            if (curr.previous_outpoint_address === selectedAddress.address) {
                return prev + curr.previous_outpoint_amount;
            }

            return prev;
        }, 0);
        const myOutputSum = tx.outputs.reduce((prev, curr) => {
            if (curr.script_public_key_address === selectedAddress.address) {
                return prev + curr.amount;
            }

            return prev;
        }, 0);

        return {
            key: tx.transaction_id,
            timestamp: format(new Date(tx.block_time), 'yyyy-MM-dd HH:mm:ss'),
            transactionId: tx.transaction_id,
            amount: (myOutputSum - myInputSum) / 100000000,
        };
    });

    setTransactions(processedTxData);
};

export const preparePendingTranasactionHistoryRowData = (
    mempoolEntry: IMempoolEntry,
    selectedAddress: ISelectedAddress,
) => {
    const receipientAddress =
        mempoolEntry.transaction.outputs[0].verboseData.scriptPublicKeyAddress;
    let sentAmount = mempoolEntry.fee;

    if (receipientAddress != selectedAddress?.address) {
        sentAmount += mempoolEntry.transaction.outputs[0].value;
    }

    const transactionId = mempoolEntry.transaction.verboseData.transactionId;

    return {
        mempoolEntry: mempoolEntry,
        transactionId: transactionId,
        sentAmount: sentAmount,
    };
};
