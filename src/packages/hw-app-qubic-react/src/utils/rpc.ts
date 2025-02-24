import { QUBIC_RPC_URL } from '../constants';
import { qubicBalanceSchema } from './validation-schemas';

export const getBalance = async (identity: string) => {
    const response = await fetch(`${QUBIC_RPC_URL}/balances/${identity}`);

    if (!response.ok) {
        throw new Error('Failed to fetch balance');
    }

    const responseData = await response.json();

    const validatedResponseData = qubicBalanceSchema.safeParse(responseData);

    if (!validatedResponseData.success) {
        throw new Error(`Invalid balance response data for ${identity} address.`);
    }

    return validatedResponseData.data.balance;
};
