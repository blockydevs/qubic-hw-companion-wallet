import { BigNumber } from 'bignumber.js';

export const balanceToUSD = (balance: BigNumber.Value, usdPrice: BigNumber.Value) =>
    new BigNumber(balance).multipliedBy(usdPrice).toString();
