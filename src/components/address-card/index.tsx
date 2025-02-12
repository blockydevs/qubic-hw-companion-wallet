import type { PaperProps, PolymorphicComponentProps } from '@mantine/core';
import { Button, Flex, Paper, Stack, Tooltip } from '@mantine/core';
import type { ReactNode } from 'react';
import { useId } from 'react';
import { copyAddress } from '../../utils/copy';
import type { AddressCardAccountDetailsProps } from './address-card-account-details';
import { AddressCardAccountDetails } from './address-card-account-details';
import type { AddressCardButtonProps } from './address-card-button';
import { AddressCardButtonWrapper } from './address-card-button-wrapper';

export interface AddressCardProps
    extends Omit<PolymorphicComponentProps<'paper', PaperProps>, 'component' | 'children'> {
    accountDetails: Omit<AddressCardAccountDetailsProps, 'onCopyAddressClick'> & {
        showCopyAddressButton?: boolean;
    };
    afterAccountDetails?: ReactNode;
    buttons?: AddressCardButtonProps[];
}

export const AddressCard = ({
    accountDetails: {
        address,
        accountName,
        isSelected,
        isAddressVerified,
        showCopyAddressButton = true,
        onAccountNameAndAddressClick,
        onVerifyAddressClick,
    },
    afterAccountDetails,
    buttons,
    ...paperProps
}: AddressCardProps) => {
    const id = useId();

    return (
        <Paper
            p='xl'
            styles={{
                root: {
                    width: '100%',
                },
            }}
            pb='1rem'
            component='div'
            {...paperProps}
        >
            <Stack>
                <AddressCardAccountDetails
                    accountName={accountName}
                    isSelected={isSelected}
                    address={address}
                    isAddressVerified={isAddressVerified}
                    onAccountNameAndAddressClick={onAccountNameAndAddressClick}
                    onCopyAddressClick={
                        showCopyAddressButton ? () => copyAddress(address) : undefined
                    }
                    onVerifyAddressClick={onVerifyAddressClick}
                />

                {afterAccountDetails ? afterAccountDetails : null}
            </Stack>

            {buttons && buttons.length ? (
                <Flex pt='0.75rem' w='100%' justify='center'>
                    {buttons.map(({ component, onClick, label, isExternalLink, to }, index) => (
                        <AddressCardButtonWrapper
                            to={to}
                            isExternalLink={isExternalLink}
                            key={`${id}-address-card-button-${index}`}
                        >
                            <Tooltip label={label} position='bottom'>
                                <Button variant='touch' onClick={onClick}>
                                    {component}
                                </Button>
                            </Tooltip>
                        </AddressCardButtonWrapper>
                    ))}
                </Flex>
            ) : null}
        </Paper>
    );
};
