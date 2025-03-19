import { notifications } from '@mantine/notifications';
import copy from 'copy-text-to-clipboard';

export const copyAddress = (address: string) => {
    const isCopied = copy(address);

    notifications.show({
        title: isCopied ? 'Address Copied' : 'Error',
        color: isCopied ? 'green' : 'red',
        message: isCopied ? 'Address copied to clipboard' : 'Failed to copy address',
        autoClose: true,
        loading: false,
    });
};
