import { use, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import {
    Alert,
    Button,
    Center,
    Divider,
    Flex,
    Group,
    Image,
    Stack,
    Text,
    Title,
    Transition,
} from '@mantine/core';
import { useSiteHostName } from '../../hooks/site-host-name';
import { DeviceTypeContext } from '../../providers/DeviceTypeProvider';
import { prepareAppData } from './page.utils';
import InfoIcon from '@mui/icons-material/Info';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import UsbIcon from '@mui/icons-material/Usb';
import DeveloperIcon from '@mui/icons-material/DeveloperMode';
import { IS_DEMO_MODE } from '../../constants';

export default function Home() {
    const navigate = useNavigate();

    const { setDeviceType } = use(DeviceTypeContext);
    const { siteHostname } = useSiteHostName();

    const [showVerifyUrlAlert, setShowVerifyUrlAlert] = useState(true);

    const handleConnectWithUsb = useCallback(async () => {
        const isAppDataPrepared = await prepareAppData('usb');

        if (isAppDataPrepared) {
            setDeviceType('usb');
            navigate(`/wallet/addresses`, { replace: true });
        }
    }, [navigate, setDeviceType]);

    const handleGoToDemoMode = useCallback(async () => {
        const isAppDataPrepared = await prepareAppData('demo');

        if (isAppDataPrepared) {
            setDeviceType('demo');
            navigate(`/wallet/addresses`, { replace: true });
        }
    }, [navigate, setDeviceType]);

    return (
        <Flex align='center' direction='column' w='100%'>
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

            <Group py='4rem'>
                <Image src='/Qubic-Symbol-White.svg' alt='Qubic' width={180} height={180} />
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
                    {IS_DEMO_MODE ? (
                        <>
                            <Button
                                leftSection={<DeveloperIcon fontSize='small' />}
                                rightSection={<span />}
                                variant='button-light'
                                justify='space-between'
                                onClick={handleGoToDemoMode}
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
                        onClick={handleConnectWithUsb}
                    >
                        Connect with USB
                    </Button>
                </Stack>
            </Stack>
        </Flex>
    );
}
