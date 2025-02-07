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
import UsbIcon from '@mui/icons-material/DeveloperMode';
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
                <Stack justify='center' align='center' ta='center' gap='md' maw='600px'>
                    <Title order={1} size='h2'>
                        Connect Ledger Device
                    </Title>
                    <Text>
                        To connect your Ledger device, please ensure it is plugged in and unlocked.
                        Follow the on-screen instructions to complete the connection. The connection
                        will be terminated if this page is reloaded or closed.
                    </Text>
                </Stack>

                <Stack component={Center} gap='md' maw='350px' justify='center' mx='auto'>
                    {isShowDemo ? (
                        <>
                            <Button
                                variant='button-light'
                                onClick={async () => {
                                    const isAppDataPrepared = await prepareAppData('demo');

                                    if (isAppDataPrepared) {
                                        setDeviceType('demo');
                                        navigate(`/wallet/addresses`, { replace: true });
                                    }
                                }}
                            >
                                <Group gap={10}>
                                    <DeveloperIcon fontSize='small' />
                                    Go to demo mode
                                </Group>
                            </Button>

                            <Divider />
                        </>
                    ) : null}

                    <Button disabled variant='button-light'>
                        <Group gap={10}>
                            <BluetoothIcon fontSize='small' />
                            Connect with Bluetooth
                        </Group>
                    </Button>

                    <Button
                        variant='button-light'
                        onClick={async () => {
                            const isAppDataPrepared = await prepareAppData('usb');

                            if (isAppDataPrepared) {
                                setDeviceType('usb');
                                navigate(`/wallet/addresses`, { replace: true });
                            }
                        }}
                    >
                        <Group gap={10}>
                            <UsbIcon fontSize='small' /> Connect with USB
                        </Group>
                    </Button>
                </Stack>
            </Stack>
        </Flex>
    );
}
