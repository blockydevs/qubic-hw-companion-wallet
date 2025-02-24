import type { PropsWithChildren } from 'react';
import { createContext, use, useEffect, useState } from 'react';
import { LockedDeviceError } from '@ledgerhq/errors';
import { notifications } from '@mantine/notifications';
import sha256 from 'crypto-js/sha256';
import KaspaBIP32 from '@/lib/bip32';
import type { IMempoolEntry } from '@/lib/kaspa-rpc/kaspa';
import { getAddress } from '@/lib/ledger';
import SettingsStore from '@/lib/settings-store';
import {
    demoLoadAddress,
    getDemoXPub,
    loadAddressDetails,
    loadOrScanAddressBatch,
} from '@/providers/DashboardContextProvider.utils';
import { DeviceTypeContext } from '@/providers/DeviceTypeProvider';
import { IAddressData, ISelectedAddress } from '@/types';
import { delay } from '@/utils/delay';

interface IDashboarContext {
    addresses: IAddressData[];
    setAddresses: (addresses: IAddressData[]) => void;
    selectedAddress: ISelectedAddress | null;
    setSelectedAddress: (address: ISelectedAddress | null) => void;
    deviceType: string | null;
    generateNewAddress: () => void;
    enableGenerate: boolean;
    setMempoolEntryToReplace: (mempoolEntry: IMempoolEntry | null) => void;
    mempoolEntryToReplace: IMempoolEntry | null;
    pendingTxId: string | null;
    setPendingTxId: (txId: string | null) => void;
}

const DASHBOARD_CONTEXT_INITIAL_VALUES = {
    addresses: [],
    setAddresses: () => {},
    selectedAddress: null,
    setSelectedAddress: () => {},
    deviceType: null,
    generateNewAddress: () => {},
    enableGenerate: false,
    setMempoolEntryToReplace: () => {},
    mempoolEntryToReplace: null,
    pendingTxId: null,
    setPendingTxId: () => {},
};

export const DashboardContext = createContext<IDashboarContext>(DASHBOARD_CONTEXT_INITIAL_VALUES);

export const DashboardContextProvider = ({ children }: PropsWithChildren) => {
    const [addresses, setAddresses] = useState<IAddressData[]>([]);
    const [rawAddresses, setRawAddresses] = useState<IAddressData[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<ISelectedAddress | null>(null);
    const [isTransportInitialized, setTransportInitialized] = useState(false);
    const [bip32base, setBIP32Base] = useState<KaspaBIP32>();
    const [userSettings, setUserSettings] = useState<SettingsStore>();
    const [enableGenerate, setEnableGenerate] = useState(false);
    const [mempoolEntryToReplace, setMempoolEntryToReplace] = useState<IMempoolEntry | null>(null);
    const [pendingTxId, setPendingTxId] = useState<string | null>(null);
    const { deviceType } = use(DeviceTypeContext);

    async function generateNewAddress() {
        setEnableGenerate(false);

        try {
            const newReceiveAddressIndex = userSettings.getSetting('lastReceiveIndex') + 1;

            const derivationPath = `44'/111111'/0'/0/${newReceiveAddressIndex}`;
            const { address } =
                deviceType === 'demo'
                    ? { address: bip32base.getAddress(0, newReceiveAddressIndex) }
                    : await getAddress(derivationPath);
            const rawAddress: IAddressData = {
                key: address,
                derivationPath,
                address,
                addressType: 0,
                addressIndex: newReceiveAddressIndex,
                balance: 0,
                loading: true,
                utxos: [],
            };

            setRawAddresses([...rawAddresses, rawAddress]);
            setAddresses([...rawAddresses, rawAddress]);
            userSettings.setSetting('lastReceiveIndex', newReceiveAddressIndex);

            try {
                if (deviceType === 'demo') {
                    rawAddress.balance = Math.round(Math.random() * 10000);
                    await delay(Math.round(Math.random() * 3000)).then(() => {
                        rawAddress.loading = false;
                    });
                } else {
                    await loadAddressDetails(rawAddress);
                }

                setRawAddresses([...rawAddresses, rawAddress]);
                setAddresses([...rawAddresses, rawAddress]);
            } catch (e) {
                console.error(e);
                notifications.show({
                    title: 'Error',
                    message: 'Unable to load address details. Refresh the page to retry.',
                    autoClose: false,
                    color: 'red',
                });
            }
        } catch (e) {
            console.info(e);
            if (e instanceof LockedDeviceError) {
                notifications.show({
                    title: 'Error',
                    message: e.message,
                    autoClose: false,
                    color: 'red',
                });
            } else if (e.message) {
                notifications.show({
                    title: 'Error',
                    message: `Unable to generate new address: ${e.message}`,
                    autoClose: false,
                    color: 'red',
                });
            } else {
                console.error(e);
                notifications.show({
                    title: 'Error',
                    message: 'Unable to generate new address',
                    autoClose: false,
                    color: 'red',
                });
            }
        } finally {
            setEnableGenerate(true);
        }
    }

    useEffect(() => {
        if (isTransportInitialized) {
            return () => {};
        }

        if (deviceType === 'demo') {
            setTransportInitialized(true);
            const xpub = getDemoXPub();
            setBIP32Base(new KaspaBIP32(xpub.compressedPublicKey, xpub.chainCode));
            return () => {};
        }

        return () => {};
    }, [isTransportInitialized, deviceType, bip32base]);

    useEffect(() => {
        if (!bip32base) {
            return;
        }

        // We need to somehow differentiate between different devices
        // This gives us a unique key we can use
        const storageKey = sha256(bip32base.rootNode.publicKey.toString('hex')).toString();

        setUserSettings(new SettingsStore(storageKey));
    }, [bip32base, deviceType]);

    useEffect(() => {
        if (!userSettings) {
            return;
        }
        // If not yet initialized, don't do anything yet
        if (!bip32base) {
            setAddresses([]);
            setRawAddresses([]);
            return;
        }

        if (deviceType === 'usb') {
            loadOrScanAddressBatch(bip32base, setAddresses, setRawAddresses, userSettings).finally(
                () => {
                    setEnableGenerate(true);
                },
            );
        } else if (deviceType === 'demo') {
            userSettings.setSetting('lastReceiveIndex', 0);
            demoLoadAddress(
                bip32base,
                setAddresses,
                setRawAddresses,
                userSettings.getSetting('lastReceiveIndex'),
            );
        }
    }, [bip32base, userSettings, deviceType]);

    useEffect(() => {
        if (!selectedAddress && addresses?.length === 1) {
            setSelectedAddress(addresses[0]);
        }
    }, [selectedAddress, addresses]);

    return (
        <DashboardContext
            value={{
                addresses,
                setAddresses,
                selectedAddress,
                setSelectedAddress,
                deviceType,
                generateNewAddress,
                enableGenerate,
                setMempoolEntryToReplace,
                mempoolEntryToReplace,
                pendingTxId,
                setPendingTxId,
            }}
        >
            {children}
        </DashboardContext>
    );
};
