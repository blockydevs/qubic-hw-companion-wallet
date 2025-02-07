import {
    AppShell,
    AppShellHeader,
    AppShellNavbar,
    Card,
    colorsTuple,
    Divider,
    Text,
} from '@mantine/core';
import { AppShellMain, MantineProviderProps } from '@mantine/core';

export const mantineTheme: MantineProviderProps['theme'] = {
    fontFamily: 'Space Grotesk',
    fontFamilyMonospace: 'Roboto Mono,Courier New,Courier,monospace',
    colors: {
        background: colorsTuple('#101820'),
        fontColor: colorsTuple('#ffffff'),
        brand: colorsTuple('#1bdef5'),

        addonColor: colorsTuple('#000000'),

        borderColor: colorsTuple('#222930'),
        borderColorDark: colorsTuple('#000000'),

        inputBorderColor: colorsTuple('#3a3a3a'),

        tooltipBackgroundColor: colorsTuple('#2b2b2b'),

        cardBackground: colorsTuple('#192531'),
        cardBoxShadow: colorsTuple('1px 1px 1px 0px rgba(63, 62, 62, 1)'),
        carorderColor: colorsTuple('#192531'),
    },
    primaryColor: 'brand',
    defaultRadius: '4px',

    components: {
        AppShell: AppShell.extend({
            classNames: {
                section: '.border-color',
            },
        }),
        AppShellHeader: AppShellHeader.extend({
            defaultProps: {
                bg: 'background',
            },
            classNames: {
                header: '.border-color',
            },
        }),
        AppShellMain: AppShellMain.extend({
            defaultProps: {
                bg: 'background',
            },
        }),
        AppShellNavbar: AppShellNavbar.extend({
            defaultProps: {
                bg: 'background',
            },
        }),
        Text: Text.extend({
            defaultProps: {
                c: 'fontColor',
                size: '1em',
            },
        }),
        Card: Card.extend({
            defaultProps: {
                py: '16px',
                px: '24px',
                shadow: 'cardBoxShadow',
            },
        }),
        Divider: Divider.extend({
            defaultProps: {
                color: 'borderColor',
            },
        }),
    },
};
