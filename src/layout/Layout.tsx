import { type PropsWithChildren, useLayoutEffect } from 'react';
import {
    AppShell,
    Burger,
    Center,
    Flex,
    Grid,
    Group,
    Transition,
    useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Link, useLocation } from 'react-router';
import LockIcon from '@mui/icons-material/Lock';
import {
    HEADER_HEIGHT,
    NAVBAR_TRANSITION_DURATION,
    NAVBAR_TRANSITION_TIMING_FUNCTION,
    NAVBAR_WIDTH,
} from '@/constants';

interface LayoutProps
    extends PropsWithChildren<{
        navbarContent?: React.ReactNode;
    }> {}

export const Layout = ({ children, navbarContent }: LayoutProps) => {
    const [isNavbarOpened, { open: openNavbar, close: closeNavbar, toggle: toggleNavbar }] =
        useDisclosure();
    const { pathname } = useLocation();

    const { breakpoints } = useMantineTheme();
    const isSm = useMediaQuery(`(min-width: ${breakpoints.sm})`);

    const isWalletDashboard = [
        '/wallet/addresses',
        '/wallet/overview',
        '/wallet/transactions',
    ].includes(pathname);

    useLayoutEffect(() => {
        if (!isWalletDashboard) {
            return closeNavbar();
        }

        if (isWalletDashboard && !isNavbarOpened && isSm) {
            return openNavbar();
        }
    }, [isWalletDashboard, isSm]);

    return (
        <AppShell
            className='border-color'
            header={{ height: HEADER_HEIGHT }}
            navbar={{
                width: NAVBAR_WIDTH,
                breakpoint: 'sm',
                collapsed: { mobile: !isNavbarOpened, desktop: !isNavbarOpened },
            }}
            padding='md'
        >
            <AppShell.Header>
                <Grid w='100%' h='100%' px='12px' display='flex' align='center'>
                    <Grid.Col span={3}>
                        <Transition
                            mounted={isWalletDashboard}
                            transition='fade'
                            duration={400}
                            timingFunction='ease'
                        >
                            {(styles) => (
                                <Burger
                                    lineSize={2}
                                    opened={false}
                                    onClick={toggleNavbar}
                                    size='sm'
                                    color='fontColor'
                                    style={styles}
                                />
                            )}
                        </Transition>
                    </Grid.Col>

                    <Grid.Col span='auto'>
                        <Center>
                            <img src='/qubic_wallet_dark.svg' alt='qubic logo' />
                        </Center>
                    </Grid.Col>

                    <Grid.Col span={3}>
                        <Flex gap={24} justify='flex-end'>
                            <Transition
                                mounted={isWalletDashboard}
                                transition='fade'
                                duration={NAVBAR_TRANSITION_DURATION}
                                timingFunction={NAVBAR_TRANSITION_TIMING_FUNCTION}
                            >
                                {(styles) => (
                                    <Link to='/'>
                                        <LockIcon
                                            htmlColor='var(--mantine-color-fontColor-text)'
                                            style={styles}
                                        />
                                    </Link>
                                )}
                            </Transition>
                        </Flex>
                    </Grid.Col>
                </Grid>
            </AppShell.Header>

            <AppShell.Navbar>
                <Transition
                    mounted={!!navbarContent}
                    transition='fade'
                    duration={NAVBAR_TRANSITION_DURATION}
                    timingFunction={NAVBAR_TRANSITION_TIMING_FUNCTION}
                >
                    {(styles) => (
                        <Flex direction='column' style={styles} className='navbar__content'>
                            {navbarContent}
                        </Flex>
                    )}
                </Transition>
            </AppShell.Navbar>

            <AppShell.Main pl={isNavbarOpened ? NAVBAR_WIDTH : 0}>
                <Group px='lg' py='md' w='100%'>
                    {children}
                </Group>
            </AppShell.Main>
        </AppShell>
    );
};
