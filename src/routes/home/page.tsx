'use client';

import styles from './page.module.css';
import { initTransport, getAppAndVersion } from '../../lib/ledger';
import { useNavigate } from 'react-router';

import { notifications } from '@mantine/notifications';

import { Image, Stack, Group, Text, useMantineColorScheme } from '@mantine/core';
import { TransportOpenUserCancelled } from '@ledgerhq/errors';
import { IconUsb, IconBluetooth } from '@tabler/icons-react';

import { useViewportSize } from '@mantine/hooks';
import { use, useEffect, useState } from 'react';
import { DeviceTypeContext } from '../../providers/DeviceTypeProvider';

async function prepareAppData(deviceType = 'usb') {
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
}

const WHITELIST = [
    'kasvault.io',
    'preview.kasvault.io',
    'privatepreview.kasvault.io',
    'kasvault.vercel.app',
];

export default function Home() {
    const navigate = useNavigate();
    const { width } = useViewportSize();
    const [siteHostname, setSiteHostname] = useState('INVALID SITE');
    const [isShowDemo, setIsShowDemo] = useState(false);
    const { colorScheme } = useMantineColorScheme();
    const { setDeviceType } = use(DeviceTypeContext);

    useEffect(() => {
        if (window.location.hostname === 'localhost') {
            setSiteHostname('http://localhost:3000');
        } else {
            for (const currentWhitelist of WHITELIST) {
                if (window.location.hostname === currentWhitelist) {
                    setSiteHostname(`https://${window.location.hostname}`);
                    break;
                }
            }
        }

        setIsShowDemo(window.location.hostname !== 'kasvault.io');
    }, []);

    const smallStyles = width <= 48 * 16 ? { fontSize: '1rem' } : {};

    const demoButton = isShowDemo ? (
        <Stack
            className={styles.card}
            onClick={async () => {
                const isAppDataPrepared = await prepareAppData('demo');

                if (isAppDataPrepared) {
                    setDeviceType('demo');
                    navigate(`/wallet/addresses`, { replace: true });
                }
            }}
            align='center'
        >
            <h2>
                <Group style={smallStyles}>
                    <IconBluetooth style={smallStyles} /> Go to Demo Mode <span>-&gt;</span>
                </Group>
            </h2>
            <Text>(Replaced with bluetooth in the future)</Text>
        </Stack>
    ) : null;

    return (
        <Stack className={styles.main}>
            <div>
                Verify URL is{width <= 465 ? <br /> : <>&nbsp;</>}
                <code>{siteHostname}</code>
            </div>

            <Group className={styles.center}>
                <Image
                    className={styles.logo}
                    src={
                        colorScheme === 'light' ? '/Qubic-Logo-Dark.svg' : '/Qubic-Symbol-White.svg'
                    }
                    alt='Qubic'
                    width={180}
                    height={180}
                />
            </Group>

            <Group>
                {demoButton}

                <Stack
                    className={styles.card}
                    onClick={async () => {
                        const isAppDataPrepared = await prepareAppData('usb');

                        if (isAppDataPrepared) {
                            setDeviceType('usb');
                            navigate(`/wallet/addresses`, { replace: true });
                        }
                    }}
                    align='center'
                >
                    <h2>
                        <Group style={smallStyles}>
                            <IconUsb /> Connect with USB <span>-&gt;</span>
                        </Group>
                    </h2>

                    <Text>All Ledger devices</Text>
                </Stack>
            </Group>
        </Stack>
    );
}
