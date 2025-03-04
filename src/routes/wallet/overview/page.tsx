import { use, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Divider, Loader, LoadingOverlay, Paper, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { AddressCard } from '@/components/address-card';
import { AddressCardBalance } from '@/components/address-card/address-card-balance';
import { QrCodeModal } from '@/components/qr-code-modal';
import { useQrCodeModal } from '@/hooks/qr-code';
import { useQubicPriceFromCoingecko } from '@/hooks/qubic-price';
import { useQubicCurrentTickQuery, useQubicLedgerApp } from '@/packages/hw-app-qubic-react';
import { MissingSelectedAddressView } from '@/routes/wallet/overview/missing-selected-address-view';
import { SendForm } from '@/routes/wallet/overview/send-form';
import { SendSuccessModal } from './send-success-modal';
import { DeviceTypeContext } from '@/providers/DeviceTypeProvider';
import { FullScreenLoader } from '@/components/full-screen-loader';
import { useVerifiedAddressContext } from '@/hooks/verify-address-context';
import { useVerifyAddress } from '@/hooks/verify-address';
import { useQubicSendTransactionSignedWithLedgerToRpc } from '@/hooks/qubic-send-transaction';

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

export const WalletOverviewPage = () => {
    const navigate = useNavigate();

    const { deviceType } = use(DeviceTypeContext);

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

    const { selectedAddress } = useQubicLedgerApp();

    const { verifiedIdentities } = useVerifiedAddressContext();
    const { verifyAddress } = useVerifyAddress();

    const isSelectedAddressVerified = useMemo(
        () => verifiedIdentities.includes(selectedAddress.identity),
        [selectedAddress, verifiedIdentities],
    );

    const submitButtonLabel = useMemo(
        () => (isSelectedAddressVerified ? 'Sign with Ledger and Send' : 'Verify address'),
        [isSelectedAddressVerified],
    );

    const { closeQrCodeModal, handleOpenQrCodeModal, isQrCodeModalOpened, qrCodeAddress } =
        useQrCodeModal(selectedAddress.identity ?? '');
    const [isSuccessModalOpen, { open: openSuccessModal, close: closeSuccessModal }] =
        useDisclosure();

    const {
        data: qubicPriceInUSD,
        error: qubicPriceInUSDError,
        isLoading: isQubicPriceInUSDLoading,
    } = useQubicPriceFromCoingecko();

    const {
        data: latestTick,
        isLoading: isLatestTickLoading,
        isFetching: isLatestTickFetching,
        isRefetching: isLatestTickRefetching,
        refetch: onRefreshTick,
    } = useQubicCurrentTickQuery();

    const isLatestTickLoaded =
        !isLatestTickLoading && !isLatestTickFetching && !isLatestTickRefetching;

    const { mutateAsync: sendTransactionSignedWithLedgerToRpc } =
        useQubicSendTransactionSignedWithLedgerToRpc(latestTick, {
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
        });

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
            deviceType,
            openSuccessModal,
            selectedAddress,
            sendTransactionSignedWithLedgerToRpc,
            verifiedIdentities,
            verifyAddress,
        ],
    );

    const onSubmitHandler = useCallback(
        async (values: { sendTo: string; amount: number; tick: number; resetForm: () => void }) => {
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

                await sendTransactionSignedWithLedgerToRpcHandler(values);
            } catch (error) {
                notifications.show({
                    title: 'Failed to send transaction',
                    message: error instanceof Error ? error.message : 'Unknown Error',
                    color: 'red',
                });
            }
        },
        [
            isSelectedAddressVerified,
            selectedAddress,
            sendTransactionSignedWithLedgerToRpcHandler,
            verifyAddress,
        ],
    );

    if (!selectedAddress) {
        return <MissingSelectedAddressView />;
    }

    return (
        <>
            <QrCodeModal
                isQrCodeModalOpened={isQrCodeModalOpened}
                closeQrCodeModal={closeQrCodeModal}
                qrCodeAddress={qrCodeAddress}
            />

            <SendSuccessModal
                sentTo={sentTransactionDetails?.sentTo ?? ''}
                sentTxId={sentTransactionDetails?.sentTxId ?? ''}
                sentAmount={sentTransactionDetails?.sentAmount ?? 0}
                opened={isSuccessModalOpen}
                onClose={closeSuccessModal}
            />

            <FullScreenLoader
                visible={isTransactionProcessing}
                title={fullScreenLoaderData.title}
                message={fullScreenLoaderData.message}
            />

            <Stack w='100%'>
                <Title size='h2'>Overview</Title>

                <AddressCard
                    bg='transparent'
                    p='0'
                    shadow='none'
                    maw='600px'
                    accountDetails={{
                        accountName: 'Account 1',
                        address: selectedAddress.identity,
                        isSelected: true,
                        isAddressVerified: verifiedIdentities.includes(selectedAddress.identity),
                        onVerifyAddressClick: async () => await verifyAddress(selectedAddress),
                    }}
                    afterAccountDetails={
                        <AddressCardBalance
                            balance={selectedAddress.balance.toString()}
                            balanceUSD={{
                                isLoading: isQubicPriceInUSDLoading,
                                value: qubicPriceInUSD,
                                error: qubicPriceInUSDError,
                            }}
                        />
                    }
                    buttons={[
                        {
                            component: (
                                <ContactsOutlinedIcon htmlColor='var(--mantine-color-brand-text)' />
                            ),
                            label: 'Select another address',
                            onClick: () => {
                                navigate('/wallet/addresses');
                            },
                        },
                        {
                            component: <QrCodeIcon htmlColor='var(--mantine-color-brand-text)' />,
                            label: 'QR Code',
                            onClick: () => {
                                handleOpenQrCodeModal(selectedAddress.identity);
                            },
                        },
                        {
                            component: <ExploreIcon htmlColor='var(--mantine-color-brand-text)' />,
                            label: 'Explorer',
                            isExternalLink: true,
                            to: `https://explorer.qubic.org/network/address/${selectedAddress.identity}`,
                        },
                    ]}
                />

                <Divider />

                <Paper px='lg' py='3rem' radius='sm' pos='relative'>
                    <LoadingOverlay
                        visible={!isLatestTickLoaded}
                        loaderProps={{
                            children: (
                                <Stack align='center'>
                                    <Loader size='sm' />
                                    <Text>Waiting for latest tick info</Text>
                                </Stack>
                            ),
                        }}
                    />

                    {isLatestTickLoaded ? (
                        <SendForm
                            onRefreshTick={onRefreshTick}
                            latestTick={latestTick}
                            onSubmit={onSubmitHandler}
                            isDisabled={isTransactionProcessing}
                            maxAmount={parseInt(selectedAddress.balance)}
                            selectedAddressIdentity={selectedAddress.identity}
                            submitButtonLabel={submitButtonLabel}
                        />
                    ) : (
                        <SendForm
                            latestTick={latestTick}
                            onRefreshTick={() => {}}
                            onSubmit={() => {}}
                            isDisabled={true}
                            maxAmount={0}
                            selectedAddressIdentity={selectedAddress.identity}
                            submitButtonLabel={submitButtonLabel}
                        />
                    )}
                </Paper>
            </Stack>
        </>
    );
};
