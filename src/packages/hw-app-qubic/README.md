# HWAppQubic

A JavaScript library for interacting with Qubic Ledger hardware wallets using the `@ledgerhq/hw-transport` package.

## Installation

```sh
npm install @qubic-lib/qubic-ts-library
```

### Prerequisite

Before using the `hw-app-qubic` package, your application must set up its own HID transport to communicate with a Ledger hardware wallet. To install the [`@ledgerhq/hw-transport`](https://github.com/LedgerHQ/ledger-live/tree/develop/libs/ledgerjs/packages/hw-transport) package, run:

```bash
npm install @ledgerhq/hw-transport
```

### Note

This package relies on [`@qubic-lib/qubic-ts-library`](https://github.com/qubic/ts-library) and expects usage of this library to construct transactions. To install the package, run:

```bash
npm install @qubic-lib/qubic-ts-library
```

## Usage

### Basic App Example

```ts
import Transport from '@ledgerhq/hw-transport-node-hid';
import { HWAppQubic } from 'hw-app-qubic';

async function main() {
    const transport = await Transport.create();
    const hwAppQubic = new HWAppQubic(transport);

    const version = await hwAppQubic.getVersion();
    console.log('Ledger App Version:', version);

    const publicKey = await hwAppQubic.getPublicKey();
    console.log('Public Key:', publicKey.toString('hex'));
}

main().catch(console.error);
```

### Signing a Transaction

```ts
import Transport from '@ledgerhq/hw-transport-node-hid';
import { HWAppQubic } from 'hw-app-qubic';
import { QubicTransaction } from '@qubic-lib/qubic-ts-library';

async function main() {
    const transport = await Transport.create();
    const hwAppQubic = new HWAppQubic(transport);

    const transaction = new QubicTransaction({
        sourcePublicKey: 'sourcePublicKey',
        destinationPublicKey: 'destinationPublicKey',
        amount: 1000,
        tick: 123456,
        inputType: 1,
        inputSize: 1,
    });

    const signedTransaction = await hwAppQubic.signTransaction(transaction);
    console.log('Signed Transaction:', signedTransaction);
}

main().catch(console.error);
```

## API

### `new HWAppQubic(transport: Transport)`

Creates an instance of `HWAppQubic` with the given transport.

### `getVersion(): Promise<{ version: string }>`

Retrieves the installed Qubic Ledger app version.

### `getPublicKey(derivationPath?: string, withConfirm?: boolean): Promise<Buffer>`

Retrieves the public key for the given derivation path. If `withConfirm` is `true`, the user must confirm on the device.

-   `derivationPath`: The BIP32 derivation path (default: `m/44'/1'/0'/0/0`).
-   `withConfirm`: Whether user confirmation is required (default: `false`).

### `signTransaction(transaction: IQubicTransaction): Promise<ISignTransactionReturn>`

Signs a Qubic transaction.

```ts
interface ISignTransactionReturn {
    signature: Buffer<ArrayBufferLike>;
    transaction: Uint8Array<ArrayBufferLike>;
    signedData: Uint8Array<ArrayBuffer>; // Transaction + signature
}
```

### `sendToDevice(params: ISendToDeviceParams): Promise<Buffer>`

Sends a command to the Ledger device.

-   `params`: The parameters for the command, including `instruction`, `p1`, `p2`, and `payload`.
