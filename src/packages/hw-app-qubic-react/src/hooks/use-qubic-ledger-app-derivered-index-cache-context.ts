import { use } from 'react';
import { QubicLedgerAppDeriveredIndexCacheContext } from '../providers/QubicLedgerAppDeriveredIndexCache';

export const useQubicLedgerAppDeriveredIndexCacheContext = () => {
    const context = use(QubicLedgerAppDeriveredIndexCacheContext);

    if (!context) {
        throw new Error(
            'The "useQubicLedgerAppDeriveredIndexCacheContext" is used outside of the "QubicLedgerAppDeriveredIndexCache"',
        );
    }

    return context;
};
