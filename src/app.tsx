import { Outlet, Route, Routes as RouterRoutes } from 'react-router';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/layout/Layout';
import { cssVariablesResolver, mantineTheme } from '@/layout/mantine.theme';
import { PageNotFound } from '@/components/page-not-found';
import { NavbarContent } from '@/layout/NavbarContent';
import {
    QubicLedgerAppDeriveredIndexCache,
    QubicLedgerAppProvider,
    QubicLedgerDemoModeProvider,
    QubicWalletPendingSessionTransactionsProvider,
} from '@/packages/hw-app-qubic-react';
import { DeviceTypeContext, DeviceTypeProvider } from '@/providers/DeviceTypeProvider';
import { LocaleInfoProvider } from '@/providers/LocaleInfoProvider';
import { OverlayForLoadingAddressesFromCacheProvider } from '@/providers/OverlayForLoadingAddressesFromCacheProvider';
import {
    ReconnectUserLedgerQubicAppContext,
    ReconnectUserLedgerQubicAppProvider,
} from '@/providers/ReconnectUserLedgerQubicAppProvider';
import { RequireDeviceTypeProvider } from '@/providers/RequireDeviceTypeProvider';
import { HideSensitiveDataProvider } from '@/providers/SensitiveDataHiddenProvider';
import { VerifiedAddressProvider } from '@/providers/VerifiedAddressProvider';
import Home from '@/routes/home/page';
import { WalletAddressesPage } from '@/routes/wallet/addresses/page';
import { WalletOverviewPage } from '@/routes/wallet/overview/page';
import { WalletTransactionsPage } from '@/routes/wallet/transactions/page';
import { SentTransactionDetailsProvider } from './providers/SentTransactionDetailsProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

export default function App() {
    return (
        <>
            <ColorSchemeScript />
            <DeviceTypeProvider>
                <QubicLedgerAppProvider
                    rpcUrl={process.env.REACT_APP_QUBIC_RPC_URL}
                    derivationPath={process.env.REACT_APP_QUBIC_DERIVATION_PATH}
                    transactionTickOffset={parseInt(
                        `${process.env.REACT_APP_TRANSACTION_TICK_OFFSET}`,
                    )}
                    init={false}
                >
                    <QueryClientProvider client={queryClient}>
                        <MantineProvider
                            defaultColorScheme='dark'
                            theme={mantineTheme}
                            cssVariablesResolver={cssVariablesResolver}
                        >
                            <Notifications limit={10} />

                            <Layout navbarContent={<NavbarContent />}>
                                <ReconnectUserLedgerQubicAppProvider>
                                    <RouterRoutes>
                                        <Route path='*' element={<PageNotFound />} />
                                        <Route path='/' element={<Home />} />
                                        <Route
                                            path='wallet'
                                            element={
                                                <ReconnectUserLedgerQubicAppContext.Consumer>
                                                    {({ isReconnectingInitialized }) => (
                                                        <DeviceTypeContext.Consumer>
                                                            {({ deviceType }) =>
                                                                deviceType ? (
                                                                    <RequireDeviceTypeProvider
                                                                        enabled={
                                                                            isReconnectingInitialized
                                                                        }
                                                                    >
                                                                        <QubicLedgerDemoModeProvider
                                                                            enabled={
                                                                                deviceType ===
                                                                                'demo'
                                                                            }
                                                                        >
                                                                            <QubicLedgerAppDeriveredIndexCache
                                                                                enabled={
                                                                                    deviceType !==
                                                                                    'demo'
                                                                                }
                                                                            >
                                                                                <OverlayForLoadingAddressesFromCacheProvider>
                                                                                    <QubicWalletPendingSessionTransactionsProvider>
                                                                                        <VerifiedAddressProvider>
                                                                                            <HideSensitiveDataProvider>
                                                                                                <LocaleInfoProvider>
                                                                                                    <SentTransactionDetailsProvider>
                                                                                                        <Outlet />
                                                                                                    </SentTransactionDetailsProvider>
                                                                                                </LocaleInfoProvider>
                                                                                            </HideSensitiveDataProvider>
                                                                                        </VerifiedAddressProvider>
                                                                                    </QubicWalletPendingSessionTransactionsProvider>
                                                                                </OverlayForLoadingAddressesFromCacheProvider>
                                                                            </QubicLedgerAppDeriveredIndexCache>
                                                                        </QubicLedgerDemoModeProvider>
                                                                    </RequireDeviceTypeProvider>
                                                                ) : null
                                                            }
                                                        </DeviceTypeContext.Consumer>
                                                    )}
                                                </ReconnectUserLedgerQubicAppContext.Consumer>
                                            }
                                        >
                                            <Route
                                                path='addresses'
                                                element={<WalletAddressesPage />}
                                            />
                                            <Route
                                                path='overview'
                                                element={<WalletOverviewPage />}
                                            />
                                            <Route
                                                path='transactions'
                                                element={<WalletTransactionsPage />}
                                            />
                                        </Route>
                                    </RouterRoutes>
                                </ReconnectUserLedgerQubicAppProvider>
                                <ReactQueryDevtools />
                            </Layout>
                        </MantineProvider>
                    </QueryClientProvider>
                </QubicLedgerAppProvider>
            </DeviceTypeProvider>
        </>
    );
}
