import { use, useCallback, useState } from 'react';
import { sompiToKas } from '../../../lib/kaspa-util';
import {
    SendAmountResult,
    confirmationsSinceDaaScore,
    fetchAddressDetails,
    fetchBlock,
    trackUntilConfirmed,
} from '../../../lib/ledger';
import { DashboardContext } from '../../../providers/DashboardContextProvider';
import { delay } from '../../../utils/delay';

export const useMyOverviewPage = () => {
    const {
        addresses,
        setAddresses,
        selectedAddress,
        setSelectedAddress,
        setMempoolEntryToReplace,
        mempoolEntryToReplace,
        setPendingTxId,
    } = use(DashboardContext);

    const [acceptingTxId, setAcceptingTxId] = useState<string | null>(null);
    const [confirmingTxId, setConfirmingTxId] = useState<string | null>(null);
    const [confirmationCount, setConfirmationCount] = useState<number>(0);

    const showConfirmingSection = confirmingTxId && !mempoolEntryToReplace;

    const updateAddressDetails = useCallback(
        async (result: SendAmountResult) => {
            setMempoolEntryToReplace(null);
            setPendingTxId(result.transactionId);
            setAcceptingTxId(result.transactionId);
            setConfirmingTxId(result.transactionId);

            try {
                // TODO: Fix a possible case where transaction was already added in a block before
                // we started tracking
                const acceptingBlock: any = await trackUntilConfirmed(result.transactionId);

                setAcceptingTxId(null);
                setPendingTxId(null);

                const block = await fetchBlock(acceptingBlock.acceptingBlockHash, false);

                for (let i = 0; i < 20; i++) {
                    const conf = await confirmationsSinceDaaScore(block.block.header.daaScore);
                    setConfirmationCount(conf);

                    if (conf >= 10) {
                        break;
                    }

                    await delay(1000);
                }
                // Track confirmations:
                setConfirmingTxId(null);
                setConfirmationCount(0);

                // After waiting for a bit, now we update the address details
                const addressDetails = await fetchAddressDetails(
                    selectedAddress.address,
                    selectedAddress.derivationPath,
                );

                selectedAddress.balance = sompiToKas(Number(addressDetails.balance));
                selectedAddress.utxos = addressDetails.utxos;

                if (setAddresses) {
                    addresses.forEach((address) => {
                        if (address.key === selectedAddress.key) {
                            address.balance = selectedAddress.balance;
                            address.utxos = selectedAddress.utxos;
                        }
                    });
                    setAddresses(addresses);
                }

                if (setSelectedAddress) {
                    setSelectedAddress(selectedAddress);
                }
            } finally {
                setConfirmingTxId(null);
            }
        },
        [
            addresses,
            selectedAddress,
            setAddresses,
            setSelectedAddress,
            setPendingTxId,
            setAcceptingTxId,
            setConfirmingTxId,
            setConfirmationCount,
        ],
    );

    return {
        showConfirmingSection,
        acceptingTxId,
        confirmingTxId,
        confirmationCount,
        updateAddressDetails,
    };
};
