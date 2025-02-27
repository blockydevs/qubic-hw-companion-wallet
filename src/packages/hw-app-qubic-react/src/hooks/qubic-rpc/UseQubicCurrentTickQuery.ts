import { useQuery } from '@tanstack/react-query';
import { QubicRpcService } from '../../services/qubic-rpc';
import type { ICustomUseQueryOptions } from '../../types';

interface IUseQubicCurrentTickQueryOptions extends ICustomUseQueryOptions<number> {}

export const useQubicCurrentTickQuery = (useQueryOptions?: IUseQubicCurrentTickQueryOptions) =>
    useQuery({
        queryKey: ['qubicCurrentTick'],
        queryFn: QubicRpcService.getCurrentTick,
        ...useQueryOptions,
    });
