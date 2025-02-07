import { ColorSchemeScript, Divider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Outlet, Route, Routes as RouterRoutes, useLocation } from 'react-router';
import { NavbarLink } from './components/navbar-link';
import { Layout } from './layout/Layout';
import { AppMantineProvider } from './providers/AppMantineProvider';
import Home from './routes/home/page';
import { WalletAddressesPage } from './routes/wallet/addresses/page';
import { WalletOverviewPage } from './routes/wallet/overview/page';
import { WalletTransactionsPage } from './routes/wallet/transactions/page';
import { DeviceTypeProvider } from './providers/DeviceTypeProvider';
import { DeviceTypeChecker } from './providers/DeviceChecker';
import { DashboardContextProvider } from './providers/DashboardContextProvider';

export default function App() {
    const { pathname } = useLocation();
    const showWalletDashboardMenu = pathname.startsWith('/wallet');

    return (
        <>
            <ColorSchemeScript />

            <AppMantineProvider>
                <Notifications />

                <Layout
                    navbarContent={
                        showWalletDashboardMenu ? (
                            <>
                                <NavbarLink
                                    icon='ManageHistory'
                                    to='/'
                                    label='Go back to device type selection'
                                />

                                <Divider />

                                <NavbarLink
                                    to='/wallet/addresses'
                                    icon='ImportContacts'
                                    label='Addresses'
                                />
                                <NavbarLink to='/wallet/overview' icon='Face5' label='Overview' />
                                <NavbarLink
                                    to='/wallet/transactions'
                                    icon='Bolt'
                                    label='Transactions'
                                />
                            </>
                        ) : null
                    }
                >
                    <DeviceTypeProvider>
                        <RouterRoutes>
                            <Route path='/' element={<Home />} />

                            <Route
                                path='wallet'
                                element={
                                    <DeviceTypeChecker>
                                        <DashboardContextProvider>
                                            <Outlet />
                                        </DashboardContextProvider>
                                    </DeviceTypeChecker>
                                }
                            >
                                <Route path='addresses' element={<WalletAddressesPage />} />
                                <Route path='overview' element={<WalletOverviewPage />} />
                                <Route path='transactions' element={<WalletTransactionsPage />} />
                            </Route>
                        </RouterRoutes>
                    </DeviceTypeProvider>
                </Layout>
            </AppMantineProvider>
        </>
    );
}
