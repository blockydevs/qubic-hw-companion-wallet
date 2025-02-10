import OverviewTab from './overview-tab';
import { DashboardContext } from '../../../providers/DashboardContextProvider';
import React, { use } from 'react';

export const WalletOverviewPage = () => {
    const {
        addresses,
        setAddresses,
        selectedAddress,
        setSelectedAddress,
        deviceType,
        setMempoolEntryToReplace,
        mempoolEntryToReplace,
        setPendingTxId,
    } = use(DashboardContext);

    return (
        <OverviewTab
            addresses={addresses}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            setMempoolEntryToReplace={setMempoolEntryToReplace}
            setAddresses={setAddresses}
            containerWidth={1}
            containerHeight={1}
            deviceType={deviceType}
            mempoolEntryToReplace={mempoolEntryToReplace}
            setPendingTxId={setPendingTxId}
        />
    );
};
