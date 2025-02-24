import { Text } from '@mantine/core';
import { LoadableText } from '@/components/loadable-text';
import { balanceToUSD } from '@/utils/balance';

interface AddressCardBalanceProps {
    balance: string;
    balanceUSD: {
        isLoading: boolean;
        error: null | Error;
        value: null | string | number;
    };
}

export const AddressCardBalance = ({ balance, balanceUSD }: AddressCardBalanceProps) => {
    return (
        <>
            <Text my='1.25rem' c='brand' fw='bold' size='2.2rem'>
                {balance} QUBIC
            </Text>

            <LoadableText
                isDataLoading={balanceUSD.isLoading}
                hasError={Boolean(balanceUSD.error)}
                errorText={balanceUSD.error?.message}
            >
                $ {balanceToUSD(balance, balanceUSD.value)}
            </LoadableText>
        </>
    );
};
