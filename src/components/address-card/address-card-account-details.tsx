import { Button, Group, Stack, Text, Tooltip } from '@mantine/core';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { TruncatedText } from '@/components/truncated-text';

export interface AddressCardAccountDetailsProps {
    onAccountNameAndAddressClick?: () => void;
    onCopyAddressClick?: () => void;
    onVerifyAddressClick?: () => void;
    isSelected: boolean;
    address: string;
    accountName: string;
    isAddressVerified: boolean;
}

export const AddressCardAccountDetails = ({
    address,
    isAddressVerified,
    isSelected,
    accountName,
    onAccountNameAndAddressClick,
    onCopyAddressClick,
    onVerifyAddressClick,
}: AddressCardAccountDetailsProps) => (
    <Stack gap='0' pos='relative'>
        {isSelected ? (
            <Text size='sm' c='brand' pos='absolute'>
                Selected account
            </Text>
        ) : null}

        <Group gap='sm' pt='1rem'>
            <Group
                gap='sm'
                onClick={onAccountNameAndAddressClick}
                className={onAccountNameAndAddressClick ? 'hover-text-underline' : undefined}
            >
                <Text>{accountName}</Text>

                <TruncatedText size='sm' c='grey'>
                    ({address})
                </TruncatedText>
            </Group>

            <Group gap='0'>
                {onCopyAddressClick ? (
                    <Tooltip label='Copy Address'>
                        <Button p='0.25rem' variant='touch' onClick={onCopyAddressClick}>
                            <ContentCopyIcon
                                htmlColor='var(--mantine-color-fontColor-filled)'
                                sx={{
                                    width: '1rem',
                                    height: '1rem',
                                }}
                            />
                        </Button>
                    </Tooltip>
                ) : null}

                <Tooltip
                    label={
                        isAddressVerified
                            ? 'Address verified on device'
                            : 'Verify Address on device'
                    }
                >
                    <Button p='0.25rem' variant='touch' onClick={onVerifyAddressClick}>
                        {isAddressVerified ? (
                            <VerifiedUserIcon
                                htmlColor='var(--mantine-color-fontColor-filled)'
                                sx={{
                                    width: '1rem',
                                    height: '1rem',
                                }}
                            />
                        ) : (
                            <ShieldOutlinedIcon
                                htmlColor='var(--mantine-color-fontColor-filled)'
                                sx={{
                                    width: '1rem',
                                    height: '1rem',
                                }}
                            />
                        )}
                    </Button>
                </Tooltip>
            </Group>
        </Group>
    </Stack>
);
