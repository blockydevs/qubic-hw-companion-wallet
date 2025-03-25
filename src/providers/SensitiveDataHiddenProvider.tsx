import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useState } from 'react';

interface IHideSensitiveDataContext {
    isSensitiveDataHidden: boolean;
    toggleSensitiveDataHidden: () => void;
}

export const HideSensitiveDataContext = createContext<IHideSensitiveDataContext>(null);

export const HideSensitiveDataProvider = ({ children }: PropsWithChildren) => {
    const [isSensitiveDataHidden, setIsSensitiveDataHidden] = useState(false);

    const toggleSensitiveDataHidden = useCallback(() => {
        setIsSensitiveDataHidden((current) => !current);
    }, []);

    return (
        <HideSensitiveDataContext value={{ isSensitiveDataHidden, toggleSensitiveDataHidden }}>
            {children}
        </HideSensitiveDataContext>
    );
};
