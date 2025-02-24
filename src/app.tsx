import { Outlet, Route, Routes as RouterRoutes } from 'react-router';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './layout/Layout';
import { cssVariablesResolver, mantineTheme } from './layout/mantine.theme';
import { NavbarContent } from './layout/NavbarContent';
import {
    QubicLedgerAppDeriveredIndexCache,
    QubicLedgerAppProvider,
    QubicLedgerDemoModeProvider,
} from './packages/hw-app-qubic-react';
import { DashboardContextProvider } from './providers/DashboardContextProvider';
import { DeviceTypeContext, DeviceTypeProvider } from './providers/DeviceTypeProvider';
import { OverlayForLoadingAddressesFromCacheProvider } from './providers/OverlayForLoadingAddressesFromCacheProvider';
import { RequireDeviceTypeProvider } from './providers/RequireDeviceTypeProvider';
import { VerifiedAddressProvider } from './providers/VerifiedAddressProvider';
import Home from './routes/home/page';
import { WalletAddressesPage } from './routes/wallet/addresses/page';
import { WalletOverviewPage } from './routes/wallet/overview/page';
import { WalletTransactionsPage } from './routes/wallet/transactions/page';
import { HideSensitiveDataProvider } from './providers/SensitiveDataHiddenProvider';

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
                        <QubicLedgerAppProvider
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
                                                    <DeviceTypeContext.Consumer>
                                                        {({ deviceType }) => (
                                                            <QubicLedgerDemoModeProvider
                                                                enabled={deviceType === 'demo'}
                                                            >
                                                                <QubicLedgerAppDeriveredIndexCache
                                                                    enabled={deviceType !== 'demo'}
                                                                >
                                                                    <OverlayForLoadingAddressesFromCacheProvider>
                                                                        <VerifiedAddressProvider>
                                                                            <HideSensitiveDataProvider>
                                                                                <Outlet />
                                                                            </HideSensitiveDataProvider>
                                                                        </VerifiedAddressProvider>
                                                                    </OverlayForLoadingAddressesFromCacheProvider>
                                                                </QubicLedgerAppDeriveredIndexCache>
                                                            </QubicLedgerDemoModeProvider>
                                                        )}
                                                    </DeviceTypeContext.Consumer>
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
                        </QubicLedgerAppProvider>
                    </DeviceTypeProvider>
                </Layout>
            </MantineProvider>
        </>
    );
}
