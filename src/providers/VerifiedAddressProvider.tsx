import { notifications } from '@mantine/notifications';
import type { PropsWithChildren } from 'react';
import { createContext, use, useCallback, useEffect, useState } from 'react';
import { getAddress } from '../lib/ledger';
import { DashboardContext } from './DashboardContextProvider';
import type { ISelectedAddress } from '../types';

interface IVerifiedAddressContext {
    isAddressVerified: boolean;
    verifyAddress: (addressToVerify: ISelectedAddress) => Promise<void>;
}

export const VerifiedAddressContext = createContext<IVerifiedAddressContext>({
    isAddressVerified: false,
    verifyAddress: async (_) => {},
});

export const VerifiedAddressProvider = ({ children }: PropsWithChildren) => {
    const [isAddressVerified, setIsAddressVerified] = useState(false);

    const { selectedAddress } = use(DashboardContext);

    const verifyAddress = useCallback(
        async (addressToVerify: ISelectedAddress) => {
            if (selectedAddress?.address === addressToVerify.address && isAddressVerified) {
                return;
            }

            const notifId = notifications.show({
                title: 'Action Required',
                message: 'Please verify the address on your device',
                loading: true,
                autoClose: false,
            });

            try {
                const { address } = await getAddress(addressToVerify.derivationPath, true);

                if (address === addressToVerify.address) {
                    notifications.show({
                        title: 'Success',
                        message: 'Address verified!',
                    });
                    setIsAddressVerified(true);
                } else {
                    notifications.show({
                        title: 'Address not verified',
                        message: 'Address does not match',
                    });
                    setIsAddressVerified(false);
                }
            } catch (e) {
                if (e.statusText === 'CONDITIONS_OF_USE_NOT_SATISFIED' && e.message) {
                    notifications.show({
                        title: 'Address not verified',
                        message: e.message,
                    });
                } else {
                    console.error(e);
                    notifications.show({
                        title: 'Address not verified',
                        message: 'Failed to verify address on the device',
                        color: 'red',
                    });
                }

                setIsAddressVerified(false);
            } finally {
                notifications.hide(notifId);
            }
        },
        [isAddressVerified, selectedAddress],
    );

    useEffect(() => {
        if (!selectedAddress) {
            setIsAddressVerified(false);
            return;
        }

        verifyAddress(selectedAddress);
    }, [selectedAddress]);

    return (
        <VerifiedAddressContext value={{ isAddressVerified, verifyAddress }}>
            {children}
        </VerifiedAddressContext>
    );
};
