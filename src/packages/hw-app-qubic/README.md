# HWAppQubic

A JavaScript library for interacting with Qubic Ledger hardware wallets using the `@ledgerhq/hw-transport` package.

## Installation

```sh
npm install @ledgerhq/hw-transport @qubic-lib/qubic-ts-library
```

## Usage

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

## API

### `new HWAppQubic(transport: Transport)`

Creates an instance of `HWAppQubic` with the given transport.

### `getVersion(): Promise<{ version: string }>`

Retrieves the installed Qubic Ledger app version.

### `getPublicKey(derivationPath?: string, withConfirm?: boolean): Promise<Buffer>`

Retrieves the public key for the given derivation path. If `withConfirm` is `true`, the user must confirm on the device.

-   `derivationPath`: The BIP32 derivation path (default: `m/44'/1'/0'/0/0`).
-   `withConfirm`: Whether user confirmation is required (default: `false`).

### `getIdentity(derivationPath?: string, withConfirm?: boolean): Promise<string>`

Retrieves the Qubic identity associated with the given derivation path.

### `signTransaction(transaction: IQubicTransaction): Promise<IQubicTransaction>`

Signs a Qubic transaction.

### `signMessage(message: string): Promise<{ signature: string, messageHash: string }>`

Signs a message and returns the signature and message hash.
