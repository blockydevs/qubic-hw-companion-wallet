import {
    AppShell,
    AppShellHeader,
    AppShellNavbar,
    Button,
    Card,
    Checkbox,
    colorsTuple,
    createTheme,
    CSSVariablesResolver,
    defaultVariantColorsResolver,
    Divider,
    Input,
    Paper,
    parseThemeColor,
    SegmentedControl,
    Text,
    Title,
    VariantColorsResolver,
} from '@mantine/core';
import { AppShellMain } from '@mantine/core';
import {
    HEADER_HEIGHT,
    MAX_APP_WIDTH,
    NAVBAR_TRANSITION_DURATION,
    NAVBAR_TRANSITION_TIMING_FUNCTION,
    NAVBAR_WIDTH,
} from '../constants';

const variantColorResolver: VariantColorsResolver = (input) => {
    const defaultResolvedColors = defaultVariantColorsResolver(input);
    const parsedColor = parseThemeColor({
        color: input.color || input.theme.primaryColor,
        theme: input.theme,
    });

    if (input.variant === 'filled') {
        return {
            ...defaultResolvedColors,
            color: '#000',
        };
    }

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

export const cssVariablesResolver: CSSVariablesResolver = (theme) => ({
    variables: {
        '--mantine-max-app-width': theme.other.maxAppWidth,
        '--mantine-navbar-width': theme.other.navbarWidth,
        '--mantine-navbar-transition-duration': theme.other.navbarTransitionDuration,
        '--mantine-navbar-transition-timing-function': theme.other.navbarTransitionTimingFunction,
        '--mantine-header-height': theme.other.headerHeight,
    },
    dark: {},
    light: {},
});

export const mantineTheme = createTheme({
    variantColorResolver: variantColorResolver,
    fontFamily: 'Space Grotesk',

    fontFamilyMonospace: 'Roboto Mono,Courier New,Courier,monospace',

    other: {
        maxAppWidth: `${MAX_APP_WIDTH}px`,
        navbarWidth: `${NAVBAR_WIDTH}px`,
        navbarTransitionDuration: `${NAVBAR_TRANSITION_DURATION}ms`,
        navbarTransitionTimingFunction: NAVBAR_TRANSITION_TIMING_FUNCTION,
        headerHeight: `${HEADER_HEIGHT}px`,
    },

    colors: {
        body: colorsTuple('#101820'),
        background: colorsTuple('#101820'),
        fontColor: colorsTuple('#ffffff'),
        brand: colorsTuple('#1bdef5'),

        addonColor: colorsTuple('#000000'),

        borderColor: colorsTuple('#222930'),
        borderColorDark: colorsTuple('#000000'),

        inputBackgroundColor: colorsTuple('#222e39'),
        inputBorderColor: colorsTuple('#3a3a3a'),

        tooltipBackgroundColor: colorsTuple('#2b2b2b'),

        buttonLightBackground: colorsTuple('#192531'),
        buttonLightHover: colorsTuple('#2b3641'),
        buttonLightColor: colorsTuple('#ffffff'),

        cardBackground: colorsTuple('#151e27'),
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
                    maxWidth: 'var(--mantine-max-app-width)',
                },
                root: {
                    overflow: 'hidden',
                    position: 'relative',
                    margin: '0 auto',
                    maxWidth: 'var(--mantine-max-app-width)',
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
                header: 'border-color',
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
        Paper: Paper.extend({
            defaultProps: {
                radius: 'lg',
                shadow: '1px 1px 1px 0px rgba(63, 62, 62, 1)',
                bg: 'cardBackground',
            },
        }),
        Divider: Divider.extend({
            defaultProps: {
                color: 'borderColor',
            },
        }),
        Button: Button.extend({
            styles: {
                root: {
                    fontWeight: 'normal',
                },
            },
        }),
        Input: Input.extend({
            classNames: {
                input: 'qubic__input',
            },
        }),
        Checkbox: Checkbox.extend({
            classNames: {
                input: 'qubic__checkbox',
            },
        }),
        SegmentedControl: SegmentedControl.extend({
            classNames: {
                indicator: 'qubic__segmented-control__indicator',
                control: 'qubic__segmented-control__control',
            },
        }),
    },
});
