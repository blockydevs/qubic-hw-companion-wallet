import { notifications } from '@mantine/notifications';
import { IAddressData } from '@/types';
import { fetchAddressBalance, fetchAddressDetails, getAddress } from '@/lib/ledger';
import { kasToSompi, NETWORK_UTXO_LIMIT, sompiToKas } from '@/lib/kaspa-util';
import { delay } from '@/utils/delay';

let loadingAddressBatch = false;
let addressInitialized = false;

const addressFilter = (lastReceiveIndex) => {
    return (addressData, index) => {
        return (
            index == 0 || // Always show the first address
            addressData.addressIndex <= lastReceiveIndex || // Always show if we've "generated" this address
            addressData.balance > 0
        ); // Always show if balance is positive
    };
};

export function loadAddressDetails(rawAddress) {
    const fetchAddressPromise = fetchAddressDetails(rawAddress.address, rawAddress.derivationPath);

    return fetchAddressPromise.then((addressDetails) => {
        rawAddress.balance = sompiToKas(Number(addressDetails.balance));
        rawAddress.utxos = addressDetails.utxos;
        // rawAddress.txCount = addressDetails.txCount;
        rawAddress.loading = false;

        return rawAddress;
    });
}

export async function loadOrScanAddressBatch(
    bip32,
    callback,
    callbackSetRawAddresses,
    userSettings,
) {
    if (loadingAddressBatch || addressInitialized) {
        return;
    }

    let lastReceiveIndex = userSettings.getSetting('lastReceiveIndex');

    loadingAddressBatch = true;

    try {
        let rawAddresses: IAddressData[] = [];

        // If receive address isn't initialized yet, scan for the last address with funds within a batch:
        if (lastReceiveIndex < 0) {
            const notifId = notifications.show({
                title: 'First-time load detected',
                message: 'Scanning for addresses with balance',
                loading: true,
            });
            console.info('Initial load detected. Scanning for addresses');
            let nonEmptyAddressFound = true;
            let scanIndexStart = 0;
            let latestWithFunds = 0;
            let addressesWithBalancesFound = 0;

            while (nonEmptyAddressFound) {
                if (scanIndexStart > 0) {
                    await delay(1000);
                }
                nonEmptyAddressFound = false;

                // scan for the next batch of 5 addresses to see which is the latest one with that had funds
                const batchSize = 5;
                console.info(
                    `Scanning receive address range ${scanIndexStart} - ${
                        scanIndexStart + batchSize - 1
                    }`,
                );

                let promises = [];
                for (
                    let addressIndex = scanIndexStart;
                    addressIndex < scanIndexStart + batchSize;
                    addressIndex++
                ) {
                    const addressType = 0; // Receive
                    const address = bip32.getAddress(addressType, addressIndex);

                    promises.push(
                        new Promise(async (resolve, reject) => {
                            try {
                                const balanceData = await fetchAddressBalance(address);

                                resolve({ balanceData, addressIndex });
                            } catch (e) {
                                reject(e);
                            }
                        }),
                    );
                }

                try {
                    const scanResults = await Promise.all(promises);

                    for (const result of scanResults) {
                        if (result.balanceData.balance > 0) {
                            if (result.addressIndex > latestWithFunds) {
                                latestWithFunds = result.addressIndex;
                            }
                            nonEmptyAddressFound = true;
                            addressesWithBalancesFound++;
                        }
                    }
                } catch (e) {
                    notifications.hide(notifId);
                    notifications.show({
                        title: 'Error',
                        message:
                            'Failed to scan for addresses with balance. Refresh the page to retry.',
                        autoClose: false,
                        color: 'red',
                    });
                    throw e;
                }

                scanIndexStart += 5;
            }

            lastReceiveIndex = latestWithFunds;
            userSettings.setSetting('lastReceiveIndex', lastReceiveIndex);
            console.info('Address scan complete. Last address index with funds', lastReceiveIndex);
            notifications.hide(notifId);
            notifications.show({
                title: 'Initial scan complete',
                message: `${addressesWithBalancesFound} ${
                    addressesWithBalancesFound <= 1 ? 'address' : 'addresses'
                } with balance found`,
            });
        }

        for (let addressIndex = 0; addressIndex <= lastReceiveIndex; addressIndex++) {
            const addressType = 0; // Receive
            const derivationPath = `44'/111111'/0'/${addressType}/${addressIndex}`;
            const address = bip32.getAddress(addressType, addressIndex);
            const receiveAddress = {
                key: address,
                address,
                derivationPath,
                balance: 0,
                loading: true,
                addressIndex,
                addressType,
                utxos: [],
            };

            rawAddresses.push(receiveAddress);

            callbackSetRawAddresses(rawAddresses);
            callback(rawAddresses.filter(addressFilter(lastReceiveIndex)));
        }

        let promises = [];
        for (const rawAddress of rawAddresses) {
            if (!rawAddress.loading) {
                continue;
            }

            promises.push(
                loadAddressDetails(rawAddress).then((data) => {
                    callback(rawAddresses.filter(addressFilter(lastReceiveIndex)));
                    return data;
                }),
            );

            if (promises.length >= 5) {
                await Promise.all(promises);

                promises = [];
            }
        }

        if (promises.length >= 0) {
            await Promise.all(promises);

            promises = [];
        }
    } finally {
        addressInitialized = true;
        loadingAddressBatch = false;
    }
}

export async function demoLoadAddress(bip32, setAddresses, setRawAddresses, lastReceiveIndex) {
    const demoAddresses = [];

    for (let i = 0; i <= lastReceiveIndex; i++) {
        const balance = Math.round(Math.random() * 10000);
        const currAddress = {
            key: i,
            address: bip32.getAddress(0, i),
            balance,
            derivationPath: `44'/111111'/0'/0/${i}`,
            utxos: [],
            loading: true,
        };

        currAddress.utxos.push({
            prevTxId: 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
            outpointIndex: 0,
            amount: kasToSompi(balance - (NETWORK_UTXO_LIMIT - 1)),
        });

        for (let j = 0; j < NETWORK_UTXO_LIMIT - 1; j++) {
            currAddress.utxos.push({
                prevTxId: 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                outpointIndex: 0,
                amount: kasToSompi(1),
            });
        }

        demoAddresses.push(currAddress);

        setRawAddresses([...demoAddresses]);
        setAddresses([...demoAddresses]);

        delay(Math.round(Math.random() * 3000)).then(() => {
            currAddress.loading = false;

            delay(Math.round(Math.random() * 2000)).then(() => {
                setAddresses([...demoAddresses]);
            });
        });
    }
}

export async function getXPubFromLedger() {
    const { chainCode, compressedPublicKey } = await getAddress("44'/111111'/0'");
    return { chainCode, compressedPublicKey };
}

export function getDemoXPub() {
    const chainCode = Buffer.from([
        11, 165, 153, 169, 197, 186, 209, 16, 96, 101, 234, 180, 123, 72, 239, 160, 112, 244, 179,
        30, 150, 57, 201, 208, 150, 247, 117, 107, 36, 138, 111, 244,
    ]);
    const compressedPublicKey = Buffer.from([
        3, 90, 25, 171, 24, 66, 175, 67, 29, 59, 79, 168, 138, 21, 177, 254, 125, 124, 63, 110, 38,
        232, 8, 18, 74, 16, 220, 5, 35, 53, 45, 70, 45,
    ]);

    return {
        compressedPublicKey,
        chainCode,
    };
}
