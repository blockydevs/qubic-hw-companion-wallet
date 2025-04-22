import {
    Divider,
    Loader,
    LoadingOverlay,
    Paper,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useNavigate } from 'react-router';
import { AddressCard } from '@/components/address-card';
import { AddressCardBalance } from '@/components/address-card/address-card-balance';
import { CardForm } from '@/components/card-form';
import { FullScreenLoader } from '@/components/full-screen-loader';
import { QrCodeModal } from '@/components/qr-code-modal';
import { useLocaleInfo } from '@/hooks/locale-info';
import { useQrCodeModal } from '@/hooks/qr-code';
import { useQubicPriceFromCoingecko } from '@/hooks/qubic-price';
import { useVerifyAddress } from '@/hooks/verify-address';
import { useVerifiedAddressContext } from '@/hooks/verify-address-context';
import { useQubicLedgerApp } from '@/packages/hw-app-qubic-react';
import { AmountField } from '@/routes/wallet/overview/-components/amount-field';
import { MissingSelectedAddressView } from '@/routes/wallet/overview/-components/missing-selected-address-view';
import { SendSuccessModal } from '@/routes/wallet/overview/-components/send-success-modal';
import { TickField } from '@/routes/wallet/overview/-components/tick-field';
import { useSendForm } from '@/routes/wallet/overview/-hooks/useSendForm';

const isTickFieldEnabled = process.env.REACT_APP_QUBIC_TICK_FIELD_VISIBLE === 'true';

export const WalletOverviewPage = () => {
    const navigate = useNavigate();

    const { selectedAddress } = useQubicLedgerApp();

    const { verifiedIdentities } = useVerifiedAddressContext();
    const { verifyAddress } = useVerifyAddress();

    const { localeSeparators } = useLocaleInfo();

    const { closeQrCodeModal, handleOpenQrCodeModal, isQrCodeModalOpened, qrCodeAddress } =
        useQrCodeModal(selectedAddress?.identity ?? '');

    const {
        data: qubicPriceInUSD,
        error: qubicPriceInUSDError,
        isLoading: isQubicPriceInUSDLoading,
    } = useQubicPriceFromCoingecko();

    const {
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
    } = useSendForm({
        isTickFieldEnabled,
        onSubmitError: (errorMessage) => {
            notifications.show({
                title: 'Failed to send transaction',
                message: errorMessage,
                color: 'red',
            });
        },
    });

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
                            balanceFormattingSettings={localeSeparators}
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

                    <CardForm
                        isSubmitButtonDisabled={isTransactionProcessing}
                        submitButtonLabel={submitButtonLabel}
                        onSubmit={onSubmitHandler}
                    >
                        <TextInput
                            label='Send to Address'
                            placeholder='Address'
                            {...form.getInputProps('sendTo')}
                            disabled={isTransactionProcessing}
                            required
                        />

                        <AmountField
                            disabled={isTransactionProcessing}
                            mantineFormInputProps={form.getInputProps('amount')}
                            setMaxAmountHandler={() => {
                                form.setValues({
                                    amount: parseInt(selectedAddress.balance),
                                });
                            }}
                        />

                        {isTickFieldEnabled && (
                            <TickField
                                disabled={isTransactionProcessing}
                                latestTick={latestTick}
                                refetchTickValue={() => {
                                    onRefetchTickValueHandler((value) =>
                                        form.setValues({
                                            tick: value,
                                        }),
                                    );
                                }}
                                mantineFormInputProps={form.getInputProps('tick')}
                                tickOffset={parseInt(process.env.REACT_APP_TRANSACTION_TICK_OFFSET)}
                            />
                        )}
                    </CardForm>
                </Paper>
            </Stack>
        </>
    );
};
