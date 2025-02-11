import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Outlet, Route, Routes as RouterRoutes } from 'react-router';
import { Layout } from './layout/Layout';
import { NavbarContent } from './layout/NavbarContent';
import { DashboardContextProvider } from './providers/DashboardContextProvider';
import { DeviceTypeProvider } from './providers/DeviceTypeProvider';
import { RequireDeviceTypeProvider } from './providers/RequireDeviceTypeProvider';
import Home from './routes/home/page';
import { WalletAddressesPage } from './routes/wallet/addresses/page';
import { WalletOverviewPage } from './routes/wallet/overview/page';
import { WalletTransactionsPage } from './routes/wallet/transactions/page';
import { cssVariablesResolver, mantineTheme } from './layout/mantine.theme';

export default function App() {
    return (
        <>
            <ColorSchemeScript />

            <MantineProvider
                defaultColorScheme='dark'
                theme={mantineTheme}
                cssVariablesResolver={cssVariablesResolver}
            >
                <Notifications />

                <Layout navbarContent={<NavbarContent />}>
                    <DeviceTypeProvider>
                        <RouterRoutes>
                            <Route path='/' element={<Home />} />

                            <Route
                                path='wallet'
                                element={
                                    <RequireDeviceTypeProvider>
                                        <DashboardContextProvider>
                                            <Outlet />
                                        </DashboardContextProvider>
                                    </RequireDeviceTypeProvider>
                                }
                            >
                                <Route path='addresses' element={<WalletAddressesPage />} />
                                <Route path='overview' element={<WalletOverviewPage />} />
                                <Route path='transactions' element={<WalletTransactionsPage />} />
                            </Route>
                        </RouterRoutes>
                    </DeviceTypeProvider>
                </Layout>
            </MantineProvider>
        </>
    );
}
