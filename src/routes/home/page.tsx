import { use, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button, Center, Divider, Flex, Group, Image, Stack, Text, Title } from '@mantine/core';
import DeveloperIcon from '@mui/icons-material/DeveloperMode';
import UsbIcon from '@mui/icons-material/Usb';
import { IS_DEMO_MODE } from '@/constants';
import { useQubicLedgerApp } from '@/packages/hw-app-qubic-react';
import { DeviceTypeContext } from '@/providers/DeviceTypeProvider';
import { prepareAppData } from '@/routes/home/page.utils';

export default function Home() {
    const navigate = useNavigate();

    const { setDeviceType } = use(DeviceTypeContext);

    const { generatedAddresses, initApp, app, reset } = useQubicLedgerApp();

    const handleConnect = useCallback(
        async (type: 'usb') => {
            const qubicLedgerApp = app ?? (await initApp());

            const isAppDataPrepared = await prepareAppData(type, qubicLedgerApp.transport);

            if (isAppDataPrepared) {
                setDeviceType(type);
                navigate(`/wallet/addresses`, { replace: true });
            }
        },
        [navigate, setDeviceType, initApp],
    );

    const handleConnectToDemo = useCallback(() => {
        setDeviceType('demo');
        navigate(`/wallet/addresses`, { replace: true });
    }, [navigate, setDeviceType]);

    const resetIfAddressesExistHandler = useCallback(() => {
        if (generatedAddresses.length) {
            reset();
        }
    }, [generatedAddresses]);

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
                        onClick={() => handleConnect('usb')}
                    >
                        Connect with USB
                    </Button>
                </Stack>
            </Stack>
        </Flex>
    );
}
