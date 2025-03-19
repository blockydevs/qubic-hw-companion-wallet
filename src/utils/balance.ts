import { BigNumber } from 'bignumber.js';
import { ILocaleSeparators } from '@/types';
import { DEFAULT_LOCALE_SEPARATORS } from '@/constants';

export const balanceToUSD = (balance: BigNumber.Value, usdPrice: BigNumber.Value) =>
    new BigNumber(balance).multipliedBy(usdPrice).toString();

export const formatBalanceDecimals = (
    balance: BigNumber.Value,
    { decimalSeparator, groupSeparator }: ILocaleSeparators = DEFAULT_LOCALE_SEPARATORS,
) =>
    new BigNumber(balance).toFormat({
        decimalSeparator,
        groupSeparator,
        groupSize: 3,
        fractionGroupSize: 0,
    });
