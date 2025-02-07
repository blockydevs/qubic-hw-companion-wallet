import { use, useState } from 'react';
import { useNavigate } from 'react-router';
import {
    Alert,
    Button,
    Center,
    Divider,
    Flex,
    Group,
    Stack,
    Text,
    Title,
    Transition,
} from '@mantine/core';
import { useHomepageSiteHostName } from '../../hooks/homepage';
import { DeviceTypeContext } from '../../providers/DeviceTypeProvider';
import { prepareAppData } from './page.utils';
import styles from './page.module.css';
import { LogoBig } from '../../components/logo-big';
import InfoIcon from '@mui/icons-material/Info';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import UsbIcon from '@mui/icons-material/Usb';
import DeveloperIcon from '@mui/icons-material/DeveloperMode';

export default function Home() {
    const navigate = useNavigate();

    const { setDeviceType } = use(DeviceTypeContext);
    const { siteHostname } = useHomepageSiteHostName();

    const isShowDemo = siteHostname !== 'https://kasvault.io';

    const [showVerifyUrlAlert, setShowVerifyUrlAlert] = useState(true);

    return (
        <Flex align='center' direction='column'>
            <Transition
                mounted={showVerifyUrlAlert}
                transition='fade'
                duration={400}
                timingFunction='ease'
            >
                {(styles) => (
                    <Alert
                        variant='light'
                        color='brand'
                        withCloseButton
                        onClose={() => setShowVerifyUrlAlert(false)}
                        title='Verify URL'
                        icon={<InfoIcon />}
                        style={styles}
                    >
                        Your verify URL is <code>{siteHostname}</code>
                    </Alert>
                )}
            </Transition>

            <Group className={styles.center}>
                <LogoBig />
            </Group>

            <Stack gap='xl'>
                <Stack gap='md'>
                    <Title order={1} size='h2' ta='center'>
                        Connect Ledger Device
                    </Title>
                    <Stack justify='center' align='center' ta='center' gap='0.275rem' maw='660px'>
                        <Text>
                            To connect your Ledger device, please ensure it is plugged in and
                            unlocked.
                        </Text>
                        <Text>
                            Follow the on-screen instructions to complete the connection. The
                            connection
                        </Text>
                        <Text>will be terminated if this page is reloaded or closed.</Text>
                    </Stack>
                </Stack>

                <Stack component={Center} gap='md' maw='350px' justify='center' mx='auto'>
                    {isShowDemo ? (
                        <>
                            <Button
                                leftSection={<DeveloperIcon fontSize='small' />}
                                rightSection={<span />}
                                variant='button-light'
                                justify='space-between'
                                onClick={async () => {
                                    const isAppDataPrepared = await prepareAppData('demo');

                                    if (isAppDataPrepared) {
                                        setDeviceType('demo');
                                        navigate(`/wallet/addresses`, { replace: true });
                                    }
                                }}
                            >
                                Go to demo mode
                            </Button>

                            <Divider />
                        </>
                    ) : null}

                    <Button
                        disabled
                        variant='button-light'
                        rightSection={<span />}
                        justify='space-between'
                        leftSection={<BluetoothIcon fontSize='small' />}
                    >
                        Connect with Bluetooth
                    </Button>

                    <Button
                        rightSection={<span />}
                        leftSection={<UsbIcon fontSize='small' />}
                        justify='space-between'
                        variant='button-light'
                        onClick={async () => {
                            const isAppDataPrepared = await prepareAppData('usb');

                            if (isAppDataPrepared) {
                                setDeviceType('usb');
                                navigate(`/wallet/addresses`, { replace: true });
                            }
                        }}
                    >
                        Connect with USB
                    </Button>
                </Stack>
            </Stack>
        </Flex>
    );
}
