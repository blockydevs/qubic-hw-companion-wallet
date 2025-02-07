import { useLayoutEffect, type PropsWithChildren } from 'react';
import {
    AppShell,
    Burger,
    Center,
    Flex,
    Grid,
    Transition,
    useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useLocation } from 'react-router';
import LockIcon from '@mui/icons-material/Lock';
import GavelIcon from '@mui/icons-material/Gavel';
import LanguageIcon from '@mui/icons-material/Language';

const NAVBAR_WIDTH = 249;
const HEADER_HEIGHT = 64;

interface LayoutProps
    extends PropsWithChildren<{
        navbarContent?: React.ReactNode;
    }> {}

export const Layout = ({ children, navbarContent }: LayoutProps) => {
    const [isNavbarOpened, { toggle: toggleNavbar }] = useDisclosure();
    const { pathname } = useLocation();
    const { colorScheme } = useMantineColorScheme();

    const isWalletDashboard = pathname.startsWith('/wallet');
    const showNavbar = isWalletDashboard;

    useLayoutEffect(() => {
        if (!showNavbar && isNavbarOpened) {
            toggleNavbar();
        } else if (showNavbar && !isNavbarOpened) {
            toggleNavbar();
        }
    }, [pathname]);

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
                            mounted={showNavbar}
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
                            {colorScheme === 'dark' ? (
                                <img src='/qubic_wallet_dark.svg' alt='qubic logo' />
                            ) : (
                                <img src='qubic_wallet_light.svg' alt='qubic logo' />
                            )}
                        </Center>
                    </Grid.Col>

                    <Grid.Col span={3}>
                        <Flex gap={24} justify='flex-end'>
                            <Transition
                                mounted={isWalletDashboard}
                                transition='fade'
                                duration={400}
                                timingFunction='ease'
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
                            <GavelIcon htmlColor='var(--mantine-color-fontColor-text)' />
                            <LanguageIcon htmlColor='var(--mantine-color-fontColor-text)' />
                        </Flex>
                    </Grid.Col>
                </Grid>
            </AppShell.Header>

            <AppShell.Navbar>
                <Transition
                    mounted={!!navbarContent}
                    transition='fade'
                    duration={400}
                    timingFunction='ease'
                >
                    {(styles) => (
                        <Flex direction='column' style={styles}>
                            {navbarContent}
                        </Flex>
                    )}
                </Transition>
            </AppShell.Navbar>

            <AppShell.Main pl={isNavbarOpened ? NAVBAR_WIDTH : 0}>{children}</AppShell.Main>
        </AppShell>
    );
};
