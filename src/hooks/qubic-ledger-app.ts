import { use, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { notifications } from '@mantine/notifications';
import { useQubicLedgerApp } from '@/packages/hw-app-qubic-react';
import { DeviceTypeContext } from '@/providers/DeviceTypeProvider';
import { checkIfQubicAppIsOpenOnLedger } from '@/routes/home/page.utils';

export const useConnectToQubicLedgerApp = () => {
    const navigate = useNavigate();

    const { setDeviceType } = use(DeviceTypeContext);

    const { initApp, app, reset } = useQubicLedgerApp();

    const handleConnectWithUsb = useCallback(async () => {
        try {
            const qubicLedgerApp = app ?? (await initApp());

            await checkIfQubicAppIsOpenOnLedger(qubicLedgerApp.transport);

            setDeviceType('usb');
            navigate(`/wallet/addresses`, { replace: true });

            return qubicLedgerApp;
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

            await navigate('/');

            return void 0;
        }
    }, [navigate, setDeviceType, initApp]);

    const handleConnectToDemo = useCallback(() => {
        setDeviceType('demo');
        navigate(`/wallet/addresses`, { replace: true });
    }, [navigate, setDeviceType]);

    return {
        handleConnectWithUsb,
        handleConnectToDemo,
    };
};
