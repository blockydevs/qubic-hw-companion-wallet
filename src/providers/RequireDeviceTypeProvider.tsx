import type { PropsWithChildren } from 'react';
import { use, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { notifications } from '@mantine/notifications';
import { DeviceTypeContext } from '@/providers/DeviceTypeProvider';

interface RequireDeviceTypeProviderProps {
    enabled?: boolean;
}

export const RequireDeviceTypeProvider = ({
    children,
    enabled,
}: PropsWithChildren<RequireDeviceTypeProviderProps>) => {
    const { deviceType } = use(DeviceTypeContext);
    const navigate = useNavigate();
    const isInitialized = useRef(false);

    const returnToHomepageIfNoDeviceTypeSet = useCallback(async () => {
        if (!deviceType) {
            notifications.show({
                title: 'Error',
                color: 'red',
                message: 'Device type not set',
                loading: false,
            });

            await navigate('/');
        }
    }, [deviceType, navigate]);

    useEffect(() => {
        if (isInitialized.current || !enabled) {
            return;
        }

        isInitialized.current = true;

        returnToHomepageIfNoDeviceTypeSet();
    }, [enabled, returnToHomepageIfNoDeviceTypeSet]);

    return children;
};
