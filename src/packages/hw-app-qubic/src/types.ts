import type Qubic from '@qubic-lib/qubic-ts-library';

export interface IPublicKey extends InstanceType<typeof Qubic.PublicKey> {}

export interface IQubicTransaction extends InstanceType<typeof Qubic.QubicTransaction> {}
