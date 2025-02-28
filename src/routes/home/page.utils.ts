import { TransportOpenUserCancelled } from '@ledgerhq/errors';
import type Transport from '@ledgerhq/hw-transport';
import { getAppAndVersion } from '@/utils/ledger';

export const checkIfQubicAppIsOpenOnLedger = async (transport: Transport) => {
    try {
        const { name } = await getAppAndVersion(transport);

        if (name !== 'Qubic') {
            throw new Error('Please open the Qubic app on your device.');
        }

        return true;
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
