import { use } from 'react';
import { QubicLedgerContext } from '../providers/QubicLedgerProvider';

export const useQubicLedgerContext = () => {
    const context = use(QubicLedgerContext);

    if (!context) {
        throw new Error('The "useQubicLedgerApp" is used outside of the "QubicLedgerProvider"');
    }

    return context;
};
