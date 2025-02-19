import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet, Route, Routes as RouterRoutes } from 'react-router';
import { Layout } from './layout/Layout';
import { cssVariablesResolver, mantineTheme } from './layout/mantine.theme';
import { NavbarContent } from './layout/NavbarContent';
import { QubicLedgerProvider } from './packages/hw-app-qubic-react';
import { DashboardContextProvider } from './providers/DashboardContextProvider';
import { DeviceTypeProvider } from './providers/DeviceTypeProvider';
import { RequireDeviceTypeProvider } from './providers/RequireDeviceTypeProvider';
import { VerifiedAddressProvider } from './providers/VerifiedAddressProvider';
import Home from './routes/home/page';
import { WalletAddressesPage } from './routes/wallet/addresses/page';
import { WalletOverviewPage } from './routes/wallet/overview/page';
import { WalletTransactionsPage } from './routes/wallet/transactions/page';
import { QubicLedgerDemoModeProvider } from './packages/hw-app-qubic-react/src/providers/QubicLedgerDemoModeProvider';

const queryClient = new QueryClient();

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
                        <QubicLedgerProvider
                            init={false}
                            derivationPath={process.env.REACT_APP_QUBIC_DERIVATION_PATH}
                        >
                            <QueryClientProvider client={queryClient}>
                                <RouterRoutes>
                                    <Route path='/' element={<Home />} />

                                    <Route
                                        path='wallet'
                                        element={
                                            <RequireDeviceTypeProvider>
                                                <DashboardContextProvider>
                                                    <QubicLedgerDemoModeProvider>
                                                        <VerifiedAddressProvider>
                                                            <Outlet />
                                                        </VerifiedAddressProvider>
                                                    </QubicLedgerDemoModeProvider>
                                                </DashboardContextProvider>
                                            </RequireDeviceTypeProvider>
                                        }
                                    >
                                        <Route path='addresses' element={<WalletAddressesPage />} />
                                        <Route path='overview' element={<WalletOverviewPage />} />
                                        <Route
                                            path='transactions'
                                            element={<WalletTransactionsPage />}
                                        />
                                    </Route>
                                </RouterRoutes>
                            </QueryClientProvider>
                        </QubicLedgerProvider>
                    </DeviceTypeProvider>
                </Layout>
            </MantineProvider>
        </>
    );
}
