import { use, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Button, Center, Flex, Group, Stack, Text, Title } from '@mantine/core';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ExploreIcon from '@mui/icons-material/Explore';
import QrCodeIcon from '@mui/icons-material/QrCode';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { AddressCard } from '../../../components/address-card';
import { AddressCardBalance } from '../../../components/address-card/address-card-balance';
import { QrCodeModal } from '../../../components/qr-code-modal';
import { useQrCodeModal } from '../../../hooks/qr-code';
import { useQubicPriceFromCoingecko } from '../../../hooks/qubic-price';
import { useQubicLedgerApp } from '../../../packages/hw-app-qubic-react';
import { DeviceTypeContext } from '../../../providers/DeviceTypeProvider';
import { VerifiedAddressContext } from '../../../providers/VerifiedAddressProvider';
import { notifications } from '@mantine/notifications';
import { IQubicLedgerAddress } from '@/src/packages/hw-app-qubic-react/src/types';

export const WalletAddressesPage = () => {
    const navigate = useNavigate();

    const {
        generatedAddresses,
        deriveNewAddress,
        clearSelectedAddress,
        selectAddressByIndex,
        selectedAddress,
        isGeneratingAddress,
    } = useQubicLedgerApp();

    const { verifiedIdentities, verifyAddress } = use(VerifiedAddressContext);

    const { deviceType } = use(DeviceTypeContext);

    const {
        data: qubicPriceInUSD,
        error: qubicPriceInUSDError,
        isLoading: isQubicPriceInUSDLoading,
    } = useQubicPriceFromCoingecko();

    const { closeQrCodeModal, handleOpenQrCodeModal, isQrCodeModalOpened, qrCodeAddress } =
        useQrCodeModal(selectedAddress?.identity ?? '');

    const isGenerateNewAddressButtonDisabled = isGeneratingAddress || deviceType === 'demo';

    const handleVerifyAddress = useCallback(
        async (address: IQubicLedgerAddress) => {
            try {
                if (verifiedIdentities.includes(address.identity)) {
                    notifications.show({
                        title: 'Warning',
                        color: 'orange',
                        message: 'Address already verified',
                    });

                    return;
                }

                await verifyAddress(address);

                notifications.show({
                    title: 'Success',
                    message: 'Address verified successfully',
                });
            } catch (error) {
                notifications.show({
                    title: 'Error',
                    color: 'red',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Failed to verify address (Unknown reason)',
                });
            }
        },
        [verifyAddress],
    );

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
                        Addresses{' '}
                        {generatedAddresses?.length ? `(${generatedAddresses.length})` : ''}
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
                            onClick={async () => await deriveNewAddress()}
                            disabled={isGenerateNewAddressButtonDisabled}
                        >
                            {isGeneratingAddress ? 'Generating...' : 'Generate New Address'}
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

                {generatedAddresses?.length >= 1 ? (
                    <Flex wrap='wrap' gap='md'>
                        {generatedAddresses.map((address, index) => (
                            <AddressCard
                                key={address.identity}
                                w='385px'
                                h='auto'
                                accountDetails={{
                                    accountName: `Account ${index + 1}`,
                                    address: address.identity,
                                    isSelected: selectedAddress?.identity === address.identity,
                                    isAddressVerified: verifiedIdentities.includes(
                                        address.identity,
                                    ),
                                    onAccountNameAndAddressClick: () =>
                                        selectAddressByIndex(address.addressIndex),
                                    onVerifyAddressClick: async () =>
                                        await handleVerifyAddress(address),
                                }}
                                afterAccountDetails={
                                    <AddressCardBalance
                                        balance='0'
                                        balanceUSD={{
                                            isLoading: isQubicPriceInUSDLoading,
                                            value: qubicPriceInUSD,
                                            error: qubicPriceInUSDError,
                                        }}
                                    />
                                }
                                buttons={[
                                    selectedAddress?.identity === address.identity
                                        ? {
                                              component: (
                                                  <CheckCircleOutlineIcon htmlColor='var(--mantine-color-brand-text)' />
                                              ),
                                              label: 'Clear address selection',
                                              onClick: () => {
                                                  clearSelectedAddress();
                                              },
                                          }
                                        : {
                                              component: (
                                                  <RadioButtonUncheckedIcon htmlColor='var(--mantine-color-brand-text)' />
                                              ),
                                              label: 'Select address',
                                              onClick: () => {
                                                  selectAddressByIndex(address.addressIndex);
                                              },
                                          },
                                    {
                                        component: (
                                            <CreditCardIcon htmlColor='var(--mantine-color-brand-text)' />
                                        ),
                                        label: 'Payment',
                                        onClick: () => {
                                            navigate('/wallet/overview');
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
                                            handleOpenQrCodeModal(address.identity);
                                        },
                                    },
                                    {
                                        component: (
                                            <ExploreIcon htmlColor='var(--mantine-color-brand-text)' />
                                        ),
                                        label: 'Explorer',
                                        isExternalLink: true,
                                        to: `https://explorer.qubic.org/network/address/${address.identity}`,
                                    },
                                ]}
                            />
                        ))}
                    </Flex>
                ) : null}
            </Group>
        </>
    );
};
