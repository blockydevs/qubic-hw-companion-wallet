import { LoadableText } from '@/components/loadable-text';
import { ILocaleSeparators } from '@/types';
import { balanceToUSD, formatBalanceDecimals } from '@/utils/balance';

interface AddressCardBalanceProps {
    balance: string;
    balanceFormattingSettings?: ILocaleSeparators;
    isLoading?: boolean;
    balanceUSD: {
        isLoading: boolean;
        error: null | Error;
        value: null | string | number;
    };
}

export const AddressCardBalance = ({
    balance,
    balanceUSD,
    isLoading,
    balanceFormattingSettings,
}: AddressCardBalanceProps) => {
    const balanceInUSD = balanceToUSD(balance, balanceUSD.value);

    return (
        <>
            <LoadableText
                my='1.25rem'
                c='brand'
                fw='bold'
                size='2.2rem'
                skeletonProps={{
                    w: '4rem',
                    h: '2.8rem',
                    my: '1.25rem',
                }}
                isDataLoading={isLoading}
                hasError={false}
                errorText=''
            >
                {formatBalanceDecimals(balance, balanceFormattingSettings)} QUBIC
            </LoadableText>

            <LoadableText
                isDataLoading={balanceUSD.isLoading}
                hasError={Boolean(balanceUSD.error)}
                errorText={balanceUSD.error?.message}
            >
                $ {formatBalanceDecimals(balanceInUSD, balanceFormattingSettings)}
            </LoadableText>
        </>
    );
};
