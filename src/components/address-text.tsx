import { Text } from '@mantine/core';

interface AddressTextProps {
    address?: string;
}

export default function AddressText({ address }: AddressTextProps) {
    if (!address) {
        return null;
    }

    const prefLen = address.split(':')[0].length;
    const endLen = 8;
    const prefix = address.substring(0, prefLen);
    const mid = address.substring(prefLen, address.length - endLen);
    const end = address.substring(address.length - endLen, address.length);

    return (
        <Text ff={'Roboto Mono,Courier New,Courier,monospace'} component='span'>
            <Text fw='600' c={'brand'} component='span'>
                {prefix}
            </Text>
            <Text fw='600' c={'gray.4'} component='span'>
                {mid}
            </Text>
            <Text fw='600' c={'brand'} component='span'>
                {end}
            </Text>
        </Text>
    );
}
