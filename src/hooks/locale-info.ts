import { LocaleInfoContext } from '@/providers/LocaleInfoProvider';
import { use } from 'react';

export const useLocaleInfo = () => {
    const ctx = use(LocaleInfoContext);

    if (!ctx) {
        throw new Error('useLocaleInfo must be used within a LocaleInfoProvider');
    }

    return ctx;
};
