import { TransportOpenUserCancelled } from '@ledgerhq/errors';
import type Transport from '@ledgerhq/hw-transport';
import { notifications } from '@mantine/notifications';
import { getAppAndVersion } from '../../lib/ledger';

export const prepareAppData = async (deviceType = 'usb', transport: Transport) => {
    if (deviceType === 'demo') {
        return true;
    }

    if (deviceType !== 'usb' && deviceType !== 'bluetooth') {
        throw new Error(`Invalid device type: ${deviceType} - must be "usb" or "bluetooth"`);
    }

    try {
        const { name } = await getAppAndVersion(transport);

        if (name == 'Qubic') {
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
