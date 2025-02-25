import { TransportOpenUserCancelled } from '@ledgerhq/errors';
import type Transport from '@ledgerhq/hw-transport';
import { getAppAndVersion } from '@/lib/ledger';

export const checkIfQubicAppIsOpenOnLedger = async (deviceType = 'usb', transport: Transport) => {
    if (deviceType === 'demo') {
        return true;
    }

    if (deviceType !== 'usb') {
        throw new Error(`Unsupported device type: ${deviceType}. Please use "usb" or "demo" mode.`);
    }

    try {
        const { name } = await getAppAndVersion(transport);

        if (name == 'Qubic') {
            return true;
        } else {
            throw new Error('Please open the Qubic app on your device.');
        }
    } catch (e) {
        if (e instanceof TransportOpenUserCancelled) {
            throw new Error(
                'WebUSB is not supported in this browser. Please use a compatible browser.',
            );
        }

        if (e instanceof Error) {
            throw new Error(`Could not interact with the Ledger device: ${e.message}`);
        }

        throw new Error('Could not interact with the Ledger device.');
    }
};
