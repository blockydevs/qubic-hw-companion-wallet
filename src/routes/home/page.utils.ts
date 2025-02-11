import { notifications } from '@mantine/notifications';
import { TransportOpenUserCancelled } from '@ledgerhq/errors';
import { getAppAndVersion, initTransport } from '../../lib/ledger';
import { SITE_NAME_WHITELIST } from '../../constants';

export const prepareAppData = async (deviceType = 'usb') => {
    if (deviceType === 'demo') {
        return true;
    }

    if (deviceType !== 'usb' && deviceType !== 'bluetooth') {
        throw new Error(`Invalid device type: ${deviceType} - must be "usb" or "bluetooth"`);
    }

    try {
        /**
         * @type {Transport}
         */
        const transport = await initTransport(deviceType);
        const { name } = await getAppAndVersion(transport);

        if (name == 'Kaspa') {
            return true;
        } else {
            notifications.show({
                title: 'Action Required',
                message: 'Please open the Kaspa app on your device.',
            });
            return false;
        }
    } catch (e) {
        if (e instanceof TransportOpenUserCancelled) {
            notifications.show({
                title: 'Action Required',
                message:
                    'WebUSB is not supported in this browser. Please use a compatible browser.',
            });
        } else {
            console.error(e);
            if (e.message) {
                notifications.show({
                    title: 'Action Required',
                    message: `Could not interact with the Ledger device: ${e.message}`,
                });
            } else {
                notifications.show({
                    title: 'Action Required',
                    message: `Could not interact with the Ledger device.`,
                });
            }
        }

        return false;
    }
};

export const getSiteHostName = () => {
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:3000';
    } else if (SITE_NAME_WHITELIST.includes(window.location.hostname)) {
        return `https://${window.location.hostname}`;
    }

    return 'INVALID SITE';
};
