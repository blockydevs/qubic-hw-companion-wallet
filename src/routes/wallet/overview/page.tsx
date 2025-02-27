import { use, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { Divider, Paper, Stack, Title } from '@mantine/core';
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
import { useQubicLedgerApp } from '@/packages/hw-app-qubic-react';
import { MissingSelectedAddressView } from '@/routes/wallet/overview/missing-selected-address-view';
import { SendForm } from '@/routes/wallet/overview/send-form';
import { SendSuccessModal } from './send-success-modal';
import { DeviceTypeContext } from '@/providers/DeviceTypeProvider';
import { FullScreenLoader } from '@/components/full-screen-loader';
import { useVerifiedAddressContext, useVerifyAddress } from '@/hooks/verify-address';
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

    const { closeQrCodeModal, handleOpenQrCodeModal, isQrCodeModalOpened, qrCodeAddress } =
        useQrCodeModal(selectedAddress.identity ?? '');
    const [isSuccessModalOpen, { open: openSuccessModal, close: closeSuccessModal }] =
        useDisclosure();

    const {
        data: qubicPriceInUSD,
        error: qubicPriceInUSDError,
        isLoading: isQubicPriceInUSDLoading,
    } = useQubicPriceFromCoingecko();

    const { mutateAsync: sendTransactionSignedWithLedgerToRpc } =
        useQubicSendTransactionSignedWithLedgerToRpc({
            onSettled: () => {
                setisTransactionProcessing(false);
            },
            onSuccess: () => {
                setisTransactionProcessing(false);
            },
            onError: (error) => {
                notifications.show({
                    title: 'Failed to broadcast transaction',
                    message: error instanceof Error ? error.message : 'Unknown Error',
                    color: 'red',
                });
            },
        });

    const onSubmitHandler = useCallback(
        async (values: { sendTo: string; amount: number; resetForm: () => void }) =>
            await sendTransactionSignedWithLedgerToRpc({
                amount: values.amount,
                sourceIdentity: selectedAddress.identity,
                destinationIdentity: values.sendTo,

                isDemoMode: deviceType === 'demo',

                onBeforeCreateTransaction: async () => {
                    if (!verifiedIdentities.includes(selectedAddress.identity)) {
                        await verifyAddress(selectedAddress);
                    }
                },

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

                <Paper px='lg' py='3rem' radius='sm'>
                    <SendForm
                        onSubmit={onSubmitHandler}
                        isDisabled={isTransactionProcessing}
                        maxAmount={parseInt(selectedAddress.balance)}
                    />
                </Paper>
            </Stack>
        </>
    );
};
