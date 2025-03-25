import { DEFAULT_LOCALE, DEFAULT_LOCALE_SEPARATORS } from '@/constants';
import type { ILocaleSeparators } from '@/types';
import { getLocaleSeparators, getUserLocale } from '@/utils/locale';
import type { PropsWithChildren } from 'react';
import { createContext, useMemo } from 'react';

interface ILocaleInfoContext {
    locale: string;
    localeSeparators: ILocaleSeparators;
}

export const LocaleInfoContext = createContext<ILocaleInfoContext>(null);

const getUserLocaleHandler = () => {
    try {
        return getUserLocale();
    } catch {
        return DEFAULT_LOCALE;
    }
};

const getLocaleSeparatorsHandler = (locale: string) => {
    try {
        return getLocaleSeparators(locale);
    } catch {
        return DEFAULT_LOCALE_SEPARATORS;
    }
};

export const LocaleInfoProvider = ({ children }: PropsWithChildren) => {
    const locale = useMemo(() => getUserLocaleHandler(), []);
    const localeSeparators = useMemo(() => getLocaleSeparatorsHandler(locale), [locale]);

    return (
        <LocaleInfoContext
            value={{
                locale,
                localeSeparators,
            }}
        >
            {children}
        </LocaleInfoContext>
    );
};
