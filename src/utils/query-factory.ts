import { createQubicRpcQueryFactory } from '@/packages/hw-app-qubic-react';

export const queryFactory = createQubicRpcQueryFactory(
    process.env.REACT_APP_QUBIC_RPC_URL,
    process.env.REACT_APP_QUBIC_API_URL,
);
