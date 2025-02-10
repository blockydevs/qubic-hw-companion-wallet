import { use } from 'react';
import { useNavigate } from 'react-router';
import { Button, Center, Flex, Group, Stack, Text, Title, Tooltip } from '@mantine/core';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExploreIcon from '@mui/icons-material/Explore';
import QrCodeIcon from '@mui/icons-material/QrCode';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { AddressCard } from '../../../components/address-card';
import { AddressCardBalance } from '../../../components/address-card-balance';
import { useQubicPriceFromCoingecko } from '../../../hooks/qubic-price';
import { DashboardContext } from '../../../providers/DashboardContextProvider';
import { VerifiedAddressContext } from '../../../providers/VerifiedAddressProvider';
import { shouldShowClearSelectedAddressButton } from './page.utils';
import { useQrCodeModal } from '../../../hooks/qr-code';
import { QrCodeModal } from '../../../components/qr-code-modal';

export const WalletAddressesPage = () => {
    const navigate = useNavigate();

    const { addresses, selectedAddress, setSelectedAddress, generateNewAddress, enableGenerate } =
        use(DashboardContext);

    const { isAddressVerified, verifyAddress } = use(VerifiedAddressContext);

    const {
        data: qubicPriceInUSD,
        error: qubicPriceInUSDError,
        isLoading: isQubicPriceInUSDLoading,
    } = useQubicPriceFromCoingecko();

    const { closeQrCodeModal, handleOpenQrCodeModal, isQrCodeModalOpened, qrCodeAddress } =
        useQrCodeModal(selectedAddress?.address ?? '');

    const clearSelectedAddressHandler = () => {
        if (addresses?.length <= 1) {
            return;
        }

        setSelectedAddress(null);
    };

    return (
        <>
            <QrCodeModal
                isQrCodeModalOpened={isQrCodeModalOpened}
                closeQrCodeModal={closeQrCodeModal}
                qrCodeAddress={qrCodeAddress}
            />

            <Group w='100%'>
                <Flex w='100%' justify='space-between'>
                    <Title order={1} size='h2'>
                        Addresses
                    </Title>

                    <Stack gap='0' align='flex-end'>
                        <Text>$1,670 / bQUBIC</Text>
                        <Text c='grey'>~ $220,306,398 MC</Text>
                    </Stack>
                </Flex>

                <Flex w='100%' justify='space-between'>
                    <Center>
                        <Button
                            leftSection={<AddCircleIcon sx={{ fontSize: '0.875rem' }} />}
                            onClick={generateNewAddress}
                            disabled={!enableGenerate}
                        >
                            Generate New Address
                        </Button>
                    </Center>

                    <Stack gap='0' align='flex-end'>
                        <Group c='grey' gap='0.5rem' align='center'>
                            <Text c='grey'>Balance in USD</Text>
                            <VisibilityOffOutlinedIcon sx={{ fontSize: '1.25rem' }} />
                        </Group>
                        <Text pt='0.25rem'>0 QUBIC / $0</Text>
                    </Stack>
                </Flex>

                {addresses?.length >= 1 ? (
                    <Flex wrap='wrap' gap='md'>
                        {addresses.map((address) => (
                            <AddressCard
                                key={address.address}
                                w='385px'
                                h='auto'
                                accountDetails={{
                                    address: address.address,
                                    isSelected: selectedAddress?.address === address.address,
                                    isAddressVerified: isAddressVerified,
                                    onAccountNameAndAddressClick: () =>
                                        navigate('/wallet/overview'),
                                    onVerifyAddressClick: () => verifyAddress(address),
                                }}
                                afterAccountDetails={
                                    <AddressCardBalance
                                        balance={address.balance.toString()}
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
                                            <CreditCardIcon htmlColor='var(--mantine-color-brand-text)' />
                                        ),
                                        label: 'Payment',
                                        onClick: () => {
                                            alert('payment');
                                        },
                                    },
                                    {
                                        component: (
                                            <RefreshIcon htmlColor='var(--mantine-color-brand-text)' />
                                        ),
                                        label: 'Refresh',
                                        onClick: () => {
                                            alert('refresh');
                                        },
                                    },
                                    {
                                        component: (
                                            <QrCodeIcon htmlColor='var(--mantine-color-brand-text)' />
                                        ),
                                        label: 'QR Code',
                                        onClick: () => {
                                            handleOpenQrCodeModal(address.address);
                                        },
                                    },
                                    {
                                        component: (
                                            <ExploreIcon htmlColor='var(--mantine-color-brand-text)' />
                                        ),
                                        label: 'Explorer',
                                        onClick: () => {
                                            alert('explorer');
                                        },
                                    },
                                    ...(shouldShowClearSelectedAddressButton({
                                        address: address.address,
                                        hasMultipleAddresses: addresses.length > 1,
                                        selectedAddress: selectedAddress?.address ?? '',
                                    })
                                        ? [
                                              {
                                                  component: (
                                                      <Tooltip label='Clear Address'>
                                                          <DeleteForeverIcon htmlColor='var(--mantine-color-brand-text)' />
                                                      </Tooltip>
                                                  ),
                                                  onClick: clearSelectedAddressHandler,
                                              },
                                          ]
                                        : []),
                                ]}
                            />
                        ))}
                    </Flex>
                ) : null}
            </Group>
        </>
    );
};
