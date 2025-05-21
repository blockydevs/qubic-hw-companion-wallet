import { useQuery } from '@tanstack/react-query';
import type { ICustomUseQueryOptions } from '../../types';
import { useQubicRpcService } from './use-qubic-rpc-service';

interface IUseQubicCurrentTickQueryOptions extends ICustomUseQueryOptions<number> {}

export const useQubicCurrentTickQuery = (useQueryOptions?: IUseQubicCurrentTickQueryOptions) => {
    const qubicRpcService = useQubicRpcService();

    return useQuery({
        queryKey: ['qubicCurrentTick'],
        queryFn: async () => await qubicRpcService.getCurrentTick(),
        refetchInterval: 10000,
        ...useQueryOptions,
    });
};
