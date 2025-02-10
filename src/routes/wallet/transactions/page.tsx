import { use } from 'react';
import TransactionsTab from './transactions-tab';
import { DashboardContext } from '../../../providers/DashboardContextProvider';

export const WalletTransactionsPage = () => {
    const { selectedAddress, setMempoolEntryToReplace, pendingTxId } = use(DashboardContext);

    return (
        <TransactionsTab
            selectedAddress={selectedAddress}
            pendingTxId={pendingTxId}
            setMempoolEntryToReplace={setMempoolEntryToReplace}
        />
    );
};
