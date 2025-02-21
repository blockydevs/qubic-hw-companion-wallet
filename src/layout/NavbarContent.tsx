import React from 'react';
import { useLocation } from 'react-router';
import { Divider } from '@mantine/core';
import { NavbarLink } from '@/components/navbar-link';

export const NavbarContent = () => {
    const { pathname } = useLocation();
    const showWalletDashboardMenu = pathname.startsWith('/wallet');

    if (!showWalletDashboardMenu) {
        return null;
    }

    return (
        <>
            <NavbarLink icon='ManageHistory' to='/' label='Go back to device type selection' />

            <Divider />

            <NavbarLink to='/wallet/addresses' icon='ImportContacts' label='Addresses' />
            <NavbarLink to='/wallet/overview' icon='Face5' label='Overview' />
            <NavbarLink to='/wallet/transactions' icon='Bolt' label='Transactions' />
        </>
    );
};
