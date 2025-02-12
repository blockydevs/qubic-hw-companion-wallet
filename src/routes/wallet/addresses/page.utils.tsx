export const shouldShowClearSelectedAddressButton = ({
    address,
    hasMultipleAddresses,
    selectedAddress,
}: {
    selectedAddress: string;
    address: string;
    hasMultipleAddresses: boolean;
}) => hasMultipleAddresses && selectedAddress === address;
