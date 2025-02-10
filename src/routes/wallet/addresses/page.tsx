import AddressesTab from './addresses-tab';
import { DashboardContext } from '../../../providers/DashboardContextProvider';
import { Button, Center, Container } from '@mantine/core';
import React, { use } from 'react';

export const WalletAddressesPage = () => {
    const { addresses, selectedAddress, setSelectedAddress, generateNewAddress, enableGenerate } =
        use(DashboardContext);

    return (
        <Container>
            <AddressesTab
                addresses={addresses}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
            />

            <Center>
                <Button onClick={generateNewAddress} disabled={!enableGenerate}>
                    Generate New Address
                </Button>
            </Center>
        </Container>
    );
};
