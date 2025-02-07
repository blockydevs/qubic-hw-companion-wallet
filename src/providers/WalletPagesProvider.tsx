import { Outlet } from 'react-router';
import { DashboardContextProvider } from './DashboardContextProvider';

export const WalletPagesProvider = () => {
    return (
        <DashboardContextProvider>
            <Outlet />
        </DashboardContextProvider>
    );
};
