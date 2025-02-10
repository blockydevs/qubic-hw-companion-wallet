import { createContext, useState } from 'react';
import type { SetStateAction, PropsWithChildren, Dispatch } from 'react';
import type { DeviceType } from '../types';

interface IDeviceTypeContext {
    deviceType: DeviceType | null;
    setDeviceType: Dispatch<SetStateAction<DeviceType>>;
}

export const DeviceTypeContext = createContext<IDeviceTypeContext>(null);

export const DeviceTypeProvider = ({ children }: PropsWithChildren) => {
    const [deviceType, setDeviceType] = useState<DeviceType | null>(null);

    return <DeviceTypeContext value={{ deviceType, setDeviceType }}>{children}</DeviceTypeContext>;
};
