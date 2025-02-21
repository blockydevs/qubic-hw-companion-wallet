import type Transport from '@ledgerhq/hw-transport';
import { StatusCodes } from '@ledgerhq/hw-transport';
import { INS, LEDGER_CLA, P1, P2 } from './constants';
import type { IQubicTransaction, ISendToDeviceParams } from './types';
import { convertDerivationPathToBuffer } from './utils';
import { schemaSendToDeviceParams } from './validation';

export class HWAppQubic {
    transport: Transport;

    constructor(transport: Transport) {
        this.transport = transport;
        this.transport.decorateAppAPIMethods(
            this,
            ['getVersion', 'getPublicKey', 'signTransaction', 'signMessage'],
            '',
        );
    }

    async sendToDevice({
        instruction,
        p1,
        p2 = P2.LAST,
        payload = Buffer.alloc(0),
    }: ISendToDeviceParams) {
        const validateParams = schemaSendToDeviceParams.safeParse({
            instruction,
            p1,
            p2,
            payload,
        });

        if (!validateParams.success) {
            throw new Error(validateParams.error.errors[0].message);
        }

        const reply = await this.transport.send(LEDGER_CLA, instruction, p1, p2, payload, [
            StatusCodes.OK,
        ]);

        return reply.subarray(0, reply.length - 2); // Remove status code
    }

    async getVersion() {
        const [major, minor, patch] = await this.sendToDevice({
            instruction: INS.GET_VERSION,
            p1: P1.NON_CONFIRM,
        });

        return { version: `${major}.${minor}.${patch}` };
    }

    async getPublicKey(derivationPath = "m/44'/1'/0'/0/0", withConfirm = false): Promise<any> {
        return await this.sendToDevice({
            instruction: INS.GET_PUBLIC_KEY,
            p1: withConfirm ? P1.CONFIRM : P1.NON_CONFIRM,
            p2: P2.LAST,
            payload: convertDerivationPathToBuffer(derivationPath),
        });
    }

    async signTransaction(transaction: IQubicTransaction): Promise<IQubicTransaction> {
        return transaction;
    }

    async signMessage(message: string) {
        const signature = message;
        const messageHash = message;

        return { signature, messageHash };
    }
}
