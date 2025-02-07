import { notifications } from '@mantine/notifications';
import type { PropsWithChildren } from 'react';
import { use, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DeviceTypeContext } from './DeviceTypeProvider';

export const DeviceTypeChecker = ({ children }: PropsWithChildren) => {
    const { deviceType } = use(DeviceTypeContext);
    const navigate = useNavigate();

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
        returnToHomepageIfNoDeviceTypeSet();
    }, [returnToHomepageIfNoDeviceTypeSet]);

    return deviceType ? children : null;
};
