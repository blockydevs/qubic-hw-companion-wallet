import { use } from 'react';
import { HideSensitiveDataContext } from '../providers/SensitiveDataHiddenProvider';

export const useHideSensitiveDataContext = () => {
    const ctx = use(HideSensitiveDataContext);

    if (!ctx) {
        throw new Error('useSensitiveDataHidden must be used within a HideSensitiveDataProvider');
    }

    return ctx;
};
