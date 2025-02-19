import { use, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Button, Center, Divider, Flex, Group, Image, Stack, Text, Title } from '@mantine/core';
import { DeviceTypeContext } from '../../providers/DeviceTypeProvider';
import { prepareAppData } from './page.utils';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import UsbIcon from '@mui/icons-material/Usb';
import DeveloperIcon from '@mui/icons-material/DeveloperMode';
import { IS_DEMO_MODE } from '../../constants';

export default function Home() {
    const navigate = useNavigate();

    const { setDeviceType } = use(DeviceTypeContext);

    const handleConnect = useCallback(
        async (type: 'usb' | 'demo') => {
            const isAppDataPrepared = await prepareAppData(type);

            if (isAppDataPrepared) {
                setDeviceType(type);
                navigate(`/wallet/addresses`, { replace: true });
            }
        },
        [navigate, setDeviceType],
    );

    return (
        <Flex align='center' direction='column' w='100%'>
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
                                onClick={() => handleConnect('demo')}
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
                        onClick={() => handleConnect('usb')}
                    >
                        Connect with USB
                    </Button>
                </Stack>
            </Stack>
        </Flex>
    );
}
