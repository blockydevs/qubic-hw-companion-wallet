import { use, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Divider, Paper, SegmentedControl, Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { AddressCard } from '@/components/address-card';
import { AddressCardBalance } from '@/components/address-card/address-card-balance';
import { QrCodeModal } from '@/components/qr-code-modal';
import { useQrCodeModal } from '@/hooks/qr-code';
import { useQubicPriceFromCoingecko } from '@/hooks/qubic-price';
import { DashboardContext } from '@/providers/DashboardContextProvider';
import { VerifiedAddressContext } from '@/providers/VerifiedAddressProvider';
import { ConfirmingSection } from '@/routes/wallet/overview/confirming-section';
import MessageForm from '@/routes/wallet/overview/message-form';
import { MissingSelectedAddressView } from '@/routes/wallet/overview/missing-selected-address-view';
import { useMyOverviewPage } from '@/routes/wallet/overview/page.hooks';
import { ReplacingTransactionSection } from '@/routes/wallet/overview/replacting-transaction-section';
import SendForm from '@/routes/wallet/overview/send-form';

const WALLET_ACTIONS = ['Transaction', 'Message'];

export const WalletOverviewPage = () => {
    const navigate = useNavigate();

    const { selectedAddress, setMempoolEntryToReplace, mempoolEntryToReplace, deviceType } =
        use(DashboardContext);

    const { verifiedIdentities } = use(VerifiedAddressContext);

    const {
        data: qubicPriceInUSD,
        error: qubicPriceInUSDError,
        isLoading: isQubicPriceInUSDLoading,
    } = useQubicPriceFromCoingecko();

    const {
        showConfirmingSection,
        acceptingTxId,
        confirmingTxId,
        confirmationCount,
        updateAddressDetails,
    } = useMyOverviewPage();

    const { closeQrCodeModal, handleOpenQrCodeModal, isQrCodeModalOpened, qrCodeAddress } =
        useQrCodeModal(selectedAddress?.address ?? '');

    const [selectedTab, setSelectedTab] = useState<(typeof WALLET_ACTIONS)[number]>('Transaction');

    const tabContent = useMemo(() => {
        switch (selectedTab) {
            case 'Transaction':
                return (
                    <SendForm
                        onSuccess={updateAddressDetails}
                        addressContext={selectedAddress}
                        mempoolEntryToReplace={mempoolEntryToReplace}
                    />
                );
            case 'Message':
                return <MessageForm selectedAddress={selectedAddress} deviceType={deviceType} />;
            default:
                return null;
        }
    }, [selectedTab, selectedAddress, deviceType, mempoolEntryToReplace, updateAddressDetails]);

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

            <Stack w='100%'>
                <Title size='h2'>Overview</Title>

                <AddressCard
                    bg='transparent'
                    p='0'
                    shadow='none'
                    maw='600px'
                    accountDetails={{
                        accountName: 'Account 1',
                        address: selectedAddress.address,
                        isSelected: true,
                        isAddressVerified: verifiedIdentities.includes(selectedAddress.address),
                        onVerifyAddressClick: () => console.log('verify address'),
                    }}
                    afterAccountDetails={
                        showConfirmingSection ? (
                            <ConfirmingSection
                                acceptingTxId={acceptingTxId}
                                confirmingTxId={confirmingTxId}
                                confirmationCount={confirmationCount}
                            />
                        ) : (
                            <AddressCardBalance
                                balance={selectedAddress.balance.toString()}
                                balanceUSD={{
                                    isLoading: isQubicPriceInUSDLoading,
                                    value: qubicPriceInUSD,
                                    error: qubicPriceInUSDError,
                                }}
                            />
                        )
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
                                handleOpenQrCodeModal(selectedAddress.address);
                            },
                        },
                        {
                            component: <ExploreIcon htmlColor='var(--mantine-color-brand-text)' />,
                            label: 'Explorer',
                            isExternalLink: true,
                            to: `https://explorer.qubic.org/network/address/${selectedAddress.address}`,
                        },
                    ]}
                />

                <Divider />

                <Paper p='lg' radius='sm'>
                    <SegmentedControl
                        data={WALLET_ACTIONS}
                        value={selectedTab}
                        onChange={setSelectedTab}
                        fullWidth
                    />

                    <Stack py='2rem' w='100%'>
                        {tabContent}
                    </Stack>

                    {mempoolEntryToReplace ? (
                        <ReplacingTransactionSection
                            onCloseNotification={() => {
                                setMempoolEntryToReplace(null);
                                notifications.show({
                                    message: 'RBF cancelled',
                                    autoClose: 3000,
                                });
                            }}
                            transactionId={
                                mempoolEntryToReplace.transaction.verboseData.transactionId
                            }
                        />
                    ) : null}
                </Paper>
            </Stack>
        </>
    );
};
