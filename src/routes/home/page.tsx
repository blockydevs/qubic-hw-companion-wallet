import { use, useCallback, useEffect } from 'react';
import { Button, Center, Divider, Flex, Group, Image, Stack, Text, Title } from '@mantine/core';
import DeveloperIcon from '@mui/icons-material/DeveloperMode';
import UsbIcon from '@mui/icons-material/Usb';
import { IS_DEMO_MODE } from '@/constants';
import { useQubicLedgerApp } from '@/packages/hw-app-qubic-react';
import { DeviceTypeContext } from '@/providers/DeviceTypeProvider';
import { checkIfQubicAppIsOpenOnLedger } from './page.utils';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router';

export default function Home() {
    const { setDeviceType } = use(DeviceTypeContext);
    const navigate = useNavigate();
    const { generatedAddresses, initApp, app, reset } = useQubicLedgerApp();

    const initNewQubicLedgerAppInstance = useCallback(
        async () =>
            await initApp({
                onDisconnect: async () => {
                    notifications.show({
                        title: 'Action required',
                        message:
                            'Ledger device disconnected. Please reconnect your device to continue.',
                        c: 'orange',
                    });

                    await navigate('/');
                },
            }),
        [initApp],
    );

    const handleConnectWithUsb = useCallback(async () => {
        try {
            const qubicLedgerApp = app ?? (await initNewQubicLedgerAppInstance());

            await checkIfQubicAppIsOpenOnLedger(qubicLedgerApp.transport);

            setDeviceType('usb');
            navigate(`/wallet/addresses`, { replace: true });
        } catch (e) {
            if (e instanceof Error) {
                const isAccessDeniedMessage = e.message === 'Access denied to use Ledger device';

                notifications.show({
                    title: 'Action required',
                    message: isAccessDeniedMessage ? 'No Ledger wallet selected' : e.message,
                    c: isAccessDeniedMessage ? 'orange' : 'blue',
                });
            } else {
                notifications.show({
                    title: 'Error',
                    c: 'red',
                    message: 'Could not connect to Ledger device',
                });
            }

            await reset();
        }
    }, [navigate, setDeviceType, initApp]);

    const handleConnectToDemo = useCallback(() => {
        setDeviceType('demo');
        navigate(`/wallet/addresses`, { replace: true });
    }, [navigate, setDeviceType]);

    const resetIfAddressesExistHandler = useCallback(() => {
        if (generatedAddresses.length) {
            reset();
        }
    }, [generatedAddresses, reset]);

    useEffect(() => {
        resetIfAddressesExistHandler();
    }, [resetIfAddressesExistHandler]);

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
                                onClick={handleConnectToDemo}
                            >
                                Go to demo mode
                            </Button>

                            <Divider />
                        </>
                    ) : null}

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
