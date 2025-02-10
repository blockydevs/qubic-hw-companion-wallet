import { Divider, Group, Modal, Paper, SegmentedControl, Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { use, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AddressCard } from '../../../components/address-card';
import { AddressCardBalance } from '../../../components/address-card-balance';
import { useQubicPriceFromCoingecko } from '../../../hooks/qubic-price';
import { DashboardContext } from '../../../providers/DashboardContextProvider';
import { VerifiedAddressContext } from '../../../providers/VerifiedAddressProvider';
import { ConfirmingSection } from './confirming-section';
import MessageForm from './message-form';
import { MissingSelectedAddressView } from './missing-selected-address-view';
import { useMyOverviewPage } from './page.hooks';
import { ReplacingTransactionSection } from './replacting-transaction-section';
import SendForm from './send-form';
import { useQrCodeModal } from '../../../hooks/qr-code';
import { QrCode } from '../../../components/qr-code';

const WALLET_ACTIONS = ['Transaction', 'Message'];

export const WalletOverviewPage = () => {
    const navigate = useNavigate();

    const { selectedAddress, setMempoolEntryToReplace, mempoolEntryToReplace, deviceType } =
        use(DashboardContext);

    const { isAddressVerified, verifyAddress } = use(VerifiedAddressContext);

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
            <Modal opened={isQrCodeModalOpened} onClose={closeQrCodeModal} title='QR Code' centered>
                <Group mx='auto' w='100%' justify='center' p='md'>
                    <QrCode value={qrCodeAddress} title={qrCodeAddress} />
                </Group>
            </Modal>

            <Stack w='100%'>
                <Title size='h2'>Overview</Title>

                <AddressCard
                    bg='transparent'
                    p='0'
                    shadow='none'
                    maw='600px'
                    accountDetails={{
                        address: selectedAddress.address,
                        isSelected: true,
                        isAddressVerified: isAddressVerified,
                        onVerifyAddressClick: () => verifyAddress(selectedAddress),
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
                            onClick: () => {
                                alert('explorer');
                            },
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
