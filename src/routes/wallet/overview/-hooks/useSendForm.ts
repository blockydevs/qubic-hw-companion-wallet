import { use, useCallback, useState } from 'react';
import { useForm } from '@mantine/form';
import { useQubicSendTransactionSignedWithLedgerToRpc } from '@/hooks/qubic-send-transaction';
import { useVerifyAddress } from '@/hooks/verify-address';
import { useVerifiedAddressContext } from '@/hooks/verify-address-context';
import { useQubicCurrentTickQuery, useQubicLedgerApp } from '@/packages/hw-app-qubic-react';
import { useQubicLedgerAppContext } from '@/packages/hw-app-qubic-react/src/hooks/use-qubic-ledger-app-context';
import { DeviceTypeContext } from '@/providers/DeviceTypeProvider';
import { useInitializeTick } from '@/routes/wallet/overview/-hooks/useInitializateTick';
import { generateValidateOptions } from '@/routes/wallet/overview/page.utils';
import { IQubicPendingTransaction } from '@/types';

interface UseSendFormProps {
    isTickFieldEnabled?: boolean;
    onSubmitError: (errorMessage: string) => void;
    onBeforeSignTransactionWithLedger: () => void;
    onBeforeBroadcastTransactionToRpc: () => void;
    onAfterBroadcastTransactionToRpc: (sentTransactionDetails: IQubicPendingTransaction) => void;
}

export const useSendForm = ({
    onSubmitError,
    onAfterBroadcastTransactionToRpc,
    onBeforeBroadcastTransactionToRpc,
    onBeforeSignTransactionWithLedger,
    isTickFieldEnabled = false,
}: UseSendFormProps) => {
    const [isTransactionProcessing, setisTransactionProcessing] = useState(false);

    const { deviceType } = use(DeviceTypeContext);

    const { selectedAddress } = useQubicLedgerApp();

    const { verifyAddress } = useVerifyAddress();
    const { verifiedIdentities } = useVerifiedAddressContext();

    const { transactionTickOffset } = useQubicLedgerAppContext();

    const {
        data: latestTick,
        isLoading: isLatestTickLoading,
        isFetching: isLatestTickFetching,
        isRefetching: isLatestTickRefetching,
        refetch: refetchTickValue,
    } = useQubicCurrentTickQuery();

    const isLatestTickLoaded =
        !isLatestTickLoading && !isLatestTickFetching && !isLatestTickRefetching;

    const form = useForm({
        initialValues: {
            sendTo: '',
            amount: 0,
            ...(isTickFieldEnabled && { tick: latestTick }),
        },
        validate: generateValidateOptions({
            maxAmount: parseInt(selectedAddress.balance),
            selectedAddressIdentity: selectedAddress.identity,
            type: isTickFieldEnabled ? 'with-tick-field' : 'without-tick-field',
            latestTick,
        }),
        validateInputOnBlur: true,
    });

    const { mutateAsync: sendTransactionSignedWithLedgerToRpc } =
        useQubicSendTransactionSignedWithLedgerToRpc(
            selectedAddress?.addressDerivationPath,
            latestTick,
            {
                onMutate: () => {
                    setisTransactionProcessing(true);
                    return []; // No need to return anything
                },
                onSuccess: () => {
                    setisTransactionProcessing(false);
                },
                onError: () => {
                    setisTransactionProcessing(false);
                },
            },
        );

    const onSubmitResetFormHandler = useCallback(async () => {
        form.reset();

        if (!isTickFieldEnabled) {
            return;
        }

        const latestTick = await refetchTickValue();

        form.setValues({
            tick: latestTick.data + parseInt(process.env.REACT_APP_TRANSACTION_TICK_OFFSET),
        });
    }, [form, isTickFieldEnabled, refetchTickValue]);

    const onSubmitHandler = useCallback(async () => {
        try {
            if (!selectedAddress) {
                throw new Error('No selected address');
            }

            if (!verifiedIdentities.includes(selectedAddress?.identity)) {
                try {
                    await verifyAddress(selectedAddress, true);
                } catch {
                    return;
                }
            }

            const { data: currentTick } = await refetchTickValue();

            const tick =
                'tick' in form.values
                    ? form.values.tick
                    : currentTick + parseInt(process.env.REACT_APP_TRANSACTION_TICK_OFFSET);

            await sendTransactionSignedWithLedgerToRpc({
                amount: form.values.amount,
                tick,
                sourceIdentity: selectedAddress.identity,
                destinationIdentity: form.values.sendTo,

                isDemoMode: deviceType === 'demo',

                onBeforeSignTransactionWithLedger,
                onBeforeBroadcastTransactionToRpc,
                onAfterBroadcastTransactionToRpc: async (sentTransactionDetails) => {
                    onAfterBroadcastTransactionToRpc({
                        amount: sentTransactionDetails.sentAmount,
                        tick: tick,
                        createdAtTick: currentTick,
                        status: 'pending',
                        to: sentTransactionDetails.sentTo,
                        txId: sentTransactionDetails.sentTxId,
                    });
                    onSubmitResetFormHandler();
                },
            });
        } catch (error) {
            onSubmitError(error instanceof Error ? error.message : 'Unknown Error');
        }
    }, [
        selectedAddress,
        verifiedIdentities,
        refetchTickValue,
        form.values,
        sendTransactionSignedWithLedgerToRpc,
        deviceType,
        onBeforeSignTransactionWithLedger,
        onBeforeBroadcastTransactionToRpc,
        verifyAddress,
        onAfterBroadcastTransactionToRpc,
        onSubmitResetFormHandler,
        onSubmitError,
    ]);

    const onRefetchTickValueHandler = useCallback(
        async (setTickFieldValue: (value: number) => void) => {
            const { data } = await refetchTickValue();

            if (data) {
                setTickFieldValue(data + parseInt(process.env.REACT_APP_TRANSACTION_TICK_OFFSET));
            }
        },
        [refetchTickValue],
    );

    useInitializeTick({
        latestTick,
        enabled: isTickFieldEnabled && isLatestTickLoaded && form.values.tick !== 0,
        onTickInitialized: (tick) => {
            form.setFieldValue('tick', tick + transactionTickOffset);
        },
    });

    return {
        form,
        isTransactionProcessing,
        latestTick,
        isLatestTickLoaded,
        onSubmitHandler,
        onRefetchTickValueHandler,
    };
};
