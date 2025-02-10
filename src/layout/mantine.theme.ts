import {
    AppShell,
    AppShellHeader,
    AppShellNavbar,
    Card,
    colorsTuple,
    defaultVariantColorsResolver,
    Divider,
    parseThemeColor,
    Text,
    Title,
    VariantColorsResolver,
} from '@mantine/core';
import { AppShellMain, MantineProviderProps } from '@mantine/core';

const variantColorResolver: VariantColorsResolver = (input) => {
    const defaultResolvedColors = defaultVariantColorsResolver(input);
    const parsedColor = parseThemeColor({
        color: input.color || input.theme.primaryColor,
        theme: input.theme,
    });

    // Add new variant
    if (input.variant === 'button-light') {
        return {
            background: 'var(--mantine-color-buttonLightBackground-filled)',
            hover: 'var(--mantine-color-buttonLightHover-filled)',
            border: `1px solid ${parsedColor.value}`,
            boxShadow: `0 0 0 1px ${parsedColor.value}`,
            color: 'var(--mantine-color-buttonLightColor-filled)',
        };
    }

    return defaultResolvedColors;
};

export const mantineTheme: MantineProviderProps['theme'] = {
    variantColorResolver: variantColorResolver,
    fontFamily: 'Space Grotesk',

    fontFamilyMonospace: 'Roboto Mono,Courier New,Courier,monospace',
    colors: {
        body: colorsTuple('#101820'),
        background: colorsTuple('#101820'),
        fontColor: colorsTuple('#ffffff'),
        brand: colorsTuple('#1bdef5'),

        addonColor: colorsTuple('#000000'),

        borderColor: colorsTuple('#222930'),
        borderColorDark: colorsTuple('#000000'),

        inputBorderColor: colorsTuple('#3a3a3a'),

        tooltipBackgroundColor: colorsTuple('#2b2b2b'),

        buttonLightBackground: colorsTuple('#192531'),
        buttonLightHover: colorsTuple('#2b3641'),
        buttonLightColor: colorsTuple('#ffffff'),

        cardBackground: colorsTuple('#192531'),
        cardBoxShadow: colorsTuple('1px 1px 1px 0px rgba(63, 62, 62, 1)'),
        carorderColor: colorsTuple('#192531'),
    },
    primaryColor: 'brand',
    defaultRadius: '4px',

    components: {
        AppShell: AppShell.extend({
            styles: {
                header: {
                    margin: '0 auto',
                    maxWidth: '1920px',
                },
                root: {
                    overflow: 'hidden',
                    position: 'relative',
                    margin: '0 auto',
                    maxWidth: '1920px',
                },
            },
            classNames: {
                header: 'border-color',
                main: 'border-color',
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
                lh: '1.3em',
            },
        }),
        Title: Title.extend({
            defaultProps: {
                c: 'fontColor',
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
