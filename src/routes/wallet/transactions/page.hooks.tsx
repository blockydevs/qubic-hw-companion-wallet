import { use, useEffect, useState, useCallback } from 'react';
import { TRANSACTIONS_PAGE_SIZE } from '../../../constants';
import { IMempoolEntry } from '../../../lib/kaspa-rpc/kaspa';
import { fetchTransactionCount, findTransactionsInMempool } from '../../../lib/ledger';
import { DashboardContext } from '../../../providers/DashboardContextProvider';
import { loadAddressTransactions, preparePendingTranasactionHistoryRowData } from './page.utils';

export const useTransactionsPage = () => {
    const { selectedAddress, setMempoolEntryToReplace, pendingTxId } = use(DashboardContext);

    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(0);
    const [txCount, setTxCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pendingTxs, setPendingTxs] = useState<IMempoolEntry[]>([]);

    const maxPages = txCount ? Math.ceil(txCount / TRANSACTIONS_PAGE_SIZE) : 0;

    const pendingRowsData = pendingTxs.map((mempoolEntry: IMempoolEntry) =>
        preparePendingTranasactionHistoryRowData(mempoolEntry, selectedAddress),
    );

    const loadInitialData = useCallback(async () => {
        if (!selectedAddress) return;

        try {
            // Fetch transaction count and update state.
            const count = await fetchTransactionCount(selectedAddress.address);
            setTxCount(count);
            setPage(1);

            // Fetch pending transactions from the mempool.
            const result = await findTransactionsInMempool([selectedAddress.address]);
            const entry = result.entries[0];

            // @ts-expect-error - it is like it was in old code. By interface, the 'sending' field shound't exist. Anyway code below doesn't do anything. I dont want to remove it yet, i need to check what is the purpose of this code.
            if (entry.address === selectedAddress.address) {
                // @ts-expect-error - it is like it was in old code. By interface, the 'sending' field shound't exist.
                const newPendingTxs = entry.sending;
                setPendingTxs((prev) => {
                    if (prev.length === 0 && newPendingTxs.length > 0) {
                        // We're increasing the number of pending transactions.
                    } else if (newPendingTxs.length === 0 && prev.length > 0) {
                        // Transactions were pending but have now confirmed.
                    }
                    return newPendingTxs;
                });
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }, [selectedAddress]);

    const loadCurrentPageTransactions = useCallback(async () => {
        if (!selectedAddress || !page) return;

        try {
            setLoading(true);

            if (!selectedAddress) {
                setTransactions([]);
                return;
            }

            const transactions = await loadAddressTransactions(selectedAddress, page, txCount);

            setTransactions(transactions);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedAddress, page, txCount]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData, pendingTxId]);

    useEffect(() => {
        loadCurrentPageTransactions();
    }, [loadCurrentPageTransactions]);

    return {
        setMempoolEntryToReplace,
        transactions,
        page,
        setPage,
        txCount,
        maxPages,
        loading,
        pendingRowsData,
    };
};
