import { use, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { notifications } from '@mantine/notifications';
import { useQubicLedgerApp } from '@/packages/hw-app-qubic-react';
import { DeviceTypeContext } from '@/providers/DeviceTypeProvider';
import { useMutation } from '@tanstack/react-query';
import type { HWAppQubic } from '@blockydevs/qubic-hw-app';
import { checkIfQubicAppIsOpenOnLedger } from '@/routes/home/page.utils';
import type Transport from '@ledgerhq/hw-transport';

export const useConnectToQubicLedgerApp = () => {
    const navigate = useNavigate();

    const { setDeviceType } = use(DeviceTypeContext);

    const { initApp, app, reset } = useQubicLedgerApp();

    const { mutate: checkIfQubicAppIsOpenOnLedgerMutate } = useMutation({
        mutationFn: async (transport: Transport) => {
            return await checkIfQubicAppIsOpenOnLedger(transport);
        },
    });

    const { mutate: prepareQubicLedgerAppMutate } = useMutation({
        mutationFn: async (currentApp: HWAppQubic | null) => {
            if (currentApp) {
                return currentApp;
            }

            return await initApp({
                onDisconnect: async () => {
                    notifications.show({
                        title: 'Action required',
                        message:
                            'Ledger device disconnected. Please reconnect your device to continue.',
                        c: 'orange',
                    });

                    await navigate('/');
                },
            });
        },
    });

    const handleError = useCallback(
        async (e: unknown) => {
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
        },
        [reset],
    );

    const handleConnectWithUsb = useCallback(async () => {
        prepareQubicLedgerAppMutate(app, {
            onSuccess: async (qubicLedgerApp) => {
                checkIfQubicAppIsOpenOnLedgerMutate(qubicLedgerApp.transport, {
                    onSuccess: async () => {
                        setDeviceType('usb');
                        navigate(`/wallet/addresses`, { replace: true });
                    },
                    onError: async (e) => {
                        await handleError(e);
                    },
                });
            },
            onError: async (e) => {
                await reset();
                await handleError(e);
            },
        });
    }, [
        prepareQubicLedgerAppMutate,
        app,
        checkIfQubicAppIsOpenOnLedgerMutate,
        setDeviceType,
        navigate,
        handleError,
        reset,
    ]);

    const handleConnectToDemo = useCallback(() => {
        setDeviceType('demo');
        navigate(`/wallet/addresses`, { replace: true });
    }, [navigate, setDeviceType]);

    return {
        handleConnectWithUsb,
        handleConnectToDemo,
    };
};
