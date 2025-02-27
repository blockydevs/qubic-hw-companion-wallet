import type Qubic from '@qubic-lib/qubic-ts-library';
import { z } from 'zod';
import { schemaSendToDeviceParams } from './validation';

export interface IPublicKey extends InstanceType<typeof Qubic.PublicKey> {}

export interface IQubicTransaction extends InstanceType<typeof Qubic.QubicTransaction> {}

export interface ISendToDeviceParams extends z.infer<typeof schemaSendToDeviceParams> {}

export interface ISignTransactionReturn {
    signature: Buffer<ArrayBufferLike>;
    transaction: Uint8Array<ArrayBufferLike>;
    signedData: Uint8Array<ArrayBuffer>;
}
