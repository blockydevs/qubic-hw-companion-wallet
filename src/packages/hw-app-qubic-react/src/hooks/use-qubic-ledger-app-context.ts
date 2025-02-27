import { use } from 'react';
import { QubicLedgerAppContext } from '../providers/QubicLedgerAppProvider';

export const useQubicLedgerAppContext = () => {
    const context = use(QubicLedgerAppContext);

    if (!context) {
        throw new Error('The "useQubicLedgerApp" is used outside of the "QubicLedgerProvider"');
    }

    return context;
};
