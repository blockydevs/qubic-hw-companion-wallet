import { use, useCallback, useMemo, useState } from 'react';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useQubicSendTransactionSignedWithLedgerToRpc } from '@/hooks/qubic-send-transaction';
import { useVerifyAddress } from '@/hooks/verify-address';
import { useVerifiedAddressContext } from '@/hooks/verify-address-context';
import { useQubicCurrentTickQuery, useQubicLedgerApp } from '@/packages/hw-app-qubic-react';
import { useQubicLedgerAppContext } from '@/packages/hw-app-qubic-react/src/hooks/use-qubic-ledger-app-context';
import { DeviceTypeContext } from '@/providers/DeviceTypeProvider';
import { useInitializeTick } from '@/routes/wallet/overview/-hooks/useInitializateTick';
import { generateValidateOptions } from '@/routes/wallet/overview/page.utils';

const fullScreenLoaderDataOptions = {
    confirmTransactionInLedger: {
        title: 'Transaction is processing',
        message: 'Please check transaction on your ledger and take action',
    },
    transactionIsBeignBroadcastedToRpc: {
        title: 'Transaction is being broadcasted to network',
        message: 'Please wait a moment',
    },
};

interface UseSendFormProps {
    isTickFieldEnabled?: boolean;
    onSubmitError: (errorMessage: string) => void;
}

export const useSendForm = ({ onSubmitError, isTickFieldEnabled = false }: UseSendFormProps) => {
    const [isTransactionProcessing, setisTransactionProcessing] = useState(false);
    const [sentTransactionDetails, setSentTransactionDetails] = useState<{
        sentTo: string;
        sentTxId: string;
        sentAmount: number;
    } | null>(null);
    const [fullScreenLoaderData, setFullScreenLoaderData] = useState<{
        title: string;
        message: string;
    } | null>(fullScreenLoaderDataOptions.confirmTransactionInLedger);

    const { deviceType } = use(DeviceTypeContext);

    const [isSuccessModalOpen, { open: openSuccessModal, close: closeSuccessModal }] =
        useDisclosure();

    const { selectedAddress } = useQubicLedgerApp();

    const { verifyAddress } = useVerifyAddress();
    const { verifiedIdentities } = useVerifiedAddressContext();

    const isSelectedAddressVerified = useMemo(
        () => verifiedIdentities.includes(selectedAddress?.identity),
        [selectedAddress, verifiedIdentities],
    );
    const submitButtonLabel = useMemo(
        () => (isSelectedAddressVerified ? 'Sign with Ledger and Send' : 'Verify address'),
        [isSelectedAddressVerified],
    );

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

    const sendTransactionSignedWithLedgerToRpcHandler = useCallback(
        async (values: { sendTo: string; amount: number; tick: number; resetForm: () => void }) =>
            await sendTransactionSignedWithLedgerToRpc({
                amount: values.amount,
                tick: values.tick,
                sourceIdentity: selectedAddress.identity,
                destinationIdentity: values.sendTo,

                isDemoMode: deviceType === 'demo',

                onBeforeSignTransactionWithLedger: () => {
                    setFullScreenLoaderData(fullScreenLoaderDataOptions.confirmTransactionInLedger);
                },

                onBeforeBroadcastTransactionToRpc: () => {
                    setFullScreenLoaderData(
                        fullScreenLoaderDataOptions.transactionIsBeignBroadcastedToRpc,
                    );
                },
                onAfterBroadcastTransactionToRpc: async (sentTransactionDetails) => {
                    setSentTransactionDetails(sentTransactionDetails);
                    openSuccessModal();
                    values.resetForm();
                },
            }),
        [
            selectedAddress,
            deviceType,
            sendTransactionSignedWithLedgerToRpc,
            openSuccessModal,
            fullScreenLoaderDataOptions.confirmTransactionInLedger,
            fullScreenLoaderDataOptions.transactionIsBeignBroadcastedToRpc,
        ],
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

            if (!isSelectedAddressVerified) {
                try {
                    await verifyAddress(selectedAddress, true);
                } catch {
                    return;
                }
            }

            const tick =
                'tick' in form.values
                    ? form.values.tick
                    : (await refetchTickValue()).data +
                      parseInt(process.env.REACT_APP_TRANSACTION_TICK_OFFSET);

            await sendTransactionSignedWithLedgerToRpcHandler({
                amount: form.values.amount,
                sendTo: form.values.sendTo,
                tick,
                resetForm: onSubmitResetFormHandler,
            });
        } catch (error) {
            onSubmitError(error instanceof Error ? error.message : 'Unknown Error');
        }
    }, [
        form,
        selectedAddress,
        isSelectedAddressVerified,
        verifyAddress,
        sendTransactionSignedWithLedgerToRpcHandler,
        refetchTickValue,
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
        submitButtonLabel,
        isTransactionProcessing,
        latestTick,
        isLatestTickLoaded,
        onSubmitHandler,
        onRefetchTickValueHandler,
        isSuccessModalOpen,
        closeSuccessModal,
        sentTransactionDetails,
        fullScreenLoaderData,
    };
};
