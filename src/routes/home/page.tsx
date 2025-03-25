import { useCallback, useEffect } from 'react';
import { Button, Center, Divider, Flex, Group, Image, Stack, Text, Title } from '@mantine/core';
import DeveloperIcon from '@mui/icons-material/DeveloperMode';
import UsbIcon from '@mui/icons-material/Usb';
import { IS_DEMO_MODE } from '@/constants';
import { useConnectToQubicLedgerApp } from '@/hooks/qubic-ledger-app';
import { useQubicLedgerApp } from '@/packages/hw-app-qubic-react';

export default function Home() {
    const { generatedAddresses, reset } = useQubicLedgerApp();

    const { handleConnectToDemo, handleConnectWithUsb } = useConnectToQubicLedgerApp();

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
