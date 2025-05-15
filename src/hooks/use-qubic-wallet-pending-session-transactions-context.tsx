import { QubicWalletPendingSessionTransactionsContext } from '@/providers/QubicWalletPendingSessionTransactionsProvider';
import { use } from 'react';

export const useQubicWalletPendingSessionTransactionsContext = () => {
    const context = use(QubicWalletPendingSessionTransactionsContext);

    if (!context) {
        throw new Error(
            'The "useQubicWalletPendingSessionTransactionsContext" is used outside of the "QubicWalletPendingSessionTransactionsContext"',
        );
    }

    return context;
};
