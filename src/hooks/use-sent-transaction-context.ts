import { SentTransactionDetailsContext } from '@/providers/SentTransactionDetailsProvider';
import { use } from 'react';

export const useSentTransactionDetailsContext = () => {
    const context = use(SentTransactionDetailsContext);

    if (!context) {
        throw new Error(
            'The "useSentTransactionDetailsContext" is used outside of the "SentTransactionDetailsContext"',
        );
    }

    return context;
};
