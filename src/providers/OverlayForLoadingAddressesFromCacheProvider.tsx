import type { PropsWithChildren } from 'react';
import { useQubicLedgerAppDeriveredIndexCacheContext } from '@/packages/hw-app-qubic-react';
import { FullScreenLoader } from '@/components/full-screen-loader';

export const OverlayForLoadingAddressesFromCacheProvider = ({ children }: PropsWithChildren) => {
    const { isLoadingAddressesFromCache } = useQubicLedgerAppDeriveredIndexCacheContext();

    return (
        <>
            <FullScreenLoader
                visible={isLoadingAddressesFromCache}
                message='Re-generation of addresses in progress'
                title='Please wait'
            />

            {children}
        </>
    );
};
