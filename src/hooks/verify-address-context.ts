import { use } from 'react';
import { VerifiedAddressContext } from '@/providers/VerifiedAddressProvider';

export const useVerifiedAddressContext = () => {
    const verifiedAddressContext = use(VerifiedAddressContext);

    if (!verifiedAddressContext) {
        throw new Error('useVerifiedAddressContext must be used within a VerifiedAddressProvider');
    }

    return verifiedAddressContext;
};
