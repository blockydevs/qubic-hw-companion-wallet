import { useId } from 'react';
import type { ReactNode } from 'react';
import { Button, Flex, Paper, Stack, Tooltip } from '@mantine/core';
import type { PaperProps, PolymorphicComponentProps } from '@mantine/core';
import { copyAddress } from '../utils/copy';
import { AddressCardAccountDetails } from './address-card-account-details';
import type { AddressCardAccountDetailsProps } from './address-card-account-details';

export interface AddressCardProps
    extends Omit<PolymorphicComponentProps<'paper', PaperProps>, 'component' | 'children'> {
    accountDetails: Omit<AddressCardAccountDetailsProps, 'onCopyAddressClick'> & {
        showCopyAddressButton?: boolean;
    };
    afterAccountDetails?: ReactNode;
    buttons?: {
        component: ReactNode;
        label?: string;
        onClick: () => void;
    }[];
}

export const AddressCard = ({
    accountDetails: {
        address,
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
                    {buttons.map(({ component, onClick, label }, index) => (
                        <Tooltip
                            label={label}
                            position='bottom'
                            key={`${id}-address-card-button-${index}`}
                        >
                            <Button variant='touch' onClick={onClick}>
                                {component}
                            </Button>
                        </Tooltip>
                    ))}
                </Flex>
            ) : null}
        </Paper>
    );
};
