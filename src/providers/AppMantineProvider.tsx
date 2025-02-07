import { MantineProvider } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { mantineTheme } from '../layout/mantine.theme';

export const AppMantineProvider = ({ children }: PropsWithChildren) => (
    <MantineProvider defaultColorScheme='dark' theme={mantineTheme}>
        {children}
    </MantineProvider>
);
