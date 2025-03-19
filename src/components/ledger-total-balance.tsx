import type { PolymorphicComponentProps, TextProps } from '@mantine/core';
import { Text } from '@mantine/core';
import { LoadableText } from '@/components/loadable-text';
import type { ILocaleSeparators } from '@/types';
import { formatBalanceDecimals } from '@/utils/balance';

interface LedgerTotalBalanceProps {
    totalBalanceOfQubicTokens: string;
    totalBalanceOfQubicTokensInUSD: string;
    isBalanceLoading: boolean;
    isBalanceInUSDLoading: boolean;
    qubicPriceInUSDError: boolean;
    balanceFormattingSettings?: ILocaleSeparators;
    containerProps?: PolymorphicComponentProps<'p', TextProps>;
}

export const LedgerTotalBalance = ({
    totalBalanceOfQubicTokens,
    totalBalanceOfQubicTokensInUSD,
    isBalanceLoading,
    isBalanceInUSDLoading,
    qubicPriceInUSDError,
    balanceFormattingSettings,
    containerProps,
}: LedgerTotalBalanceProps) => (
    <Text {...containerProps}>
        <LoadableText
            mr='0.25rem'
            component='span'
            isDataLoading={isBalanceLoading}
            hasError={false}
        >
            {formatBalanceDecimals(totalBalanceOfQubicTokens, balanceFormattingSettings)}
        </LoadableText>
        QUBIC / $
        <LoadableText
            component='span'
            isDataLoading={isBalanceInUSDLoading}
            hasError={qubicPriceInUSDError}
        >
            {formatBalanceDecimals(totalBalanceOfQubicTokensInUSD, balanceFormattingSettings)}
        </LoadableText>
    </Text>
);
