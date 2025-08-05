import { useQuery } from '@tanstack/react-query';
import type { ICustomUseQueryOptions } from '../../types';
import { useQubicRpcService } from './use-qubic-rpc-service';

interface IUseQubicCurrentTickQueryOptions extends ICustomUseQueryOptions<number> {}

export const useQubicCurrentTickQuery = (useQueryOptions?: IUseQubicCurrentTickQueryOptions) => {
    const qubicRpcService = useQubicRpcService();

    return useQuery({
        queryKey: ['qubicCurrentTick'],
        queryFn: async () => await qubicRpcService.getCurrentTick(),
        refetchInterval: parseInt(process.env.REACT_APP_QUBIC_TICK_REFRESH_INTERVAL) || 10000,
        ...useQueryOptions,
    });
};
