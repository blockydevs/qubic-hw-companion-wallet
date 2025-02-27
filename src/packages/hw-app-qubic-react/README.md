# qubic-hw-app-react

This package provides a React hook and provider to interact with the Qubic Ledger hardware wallet. Below are the instructions on how to set up and use the package.

## Known Limitations

-   Requires a WebHID-compatible browser (Chrome/Edge).
-   Demo mode generates dummy data and does not interact with a physical device.

## Installation

To install the package, run:

```bash
npm install qubic-hw-app-react
```

### React Query Provider Requirement

> If your app is not going to use any of those hooks, you can skip this requirement.

In case to usage of `useQubicRpcXXX` or `useQubicLedgerXXXMutation` hooks, to handle RPC calls efficiently, the library requires wrapping your application with a React Query provider. Ensure that your app is wrapped with `QueryClientProvider` from `@tanstack/react-query`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
    <YourApp />
</QueryClientProvider>;
```

## Usage

### Using Demo Mode

To enable demo mode (for testing without a physical device), wrap your components with `QubicLedgerDemoModeProvider`. This generates dummy addresses when the device type is set to `demo`.

```tsx
import { QubicLedgerAppProvider, QubicLedgerDemoModeProvider } from 'qubic-hw-app-react';

// Inside your component tree:
<QubicLedgerAppProvider derivationPath="m/44'/4218'/0'/0'">
    <QubicLedgerDemoModeProvider>
        {/* Components requiring demo mode */}
    </QubicLedgerDemoModeProvider>
</QubicLedgerAppProvider>;
```

### Using Cached Derivered Addressess

The `QubicLedgerAppDeriveredIndexCache` provider automatically manages the caching of derived address indexes in your browser's local storage. When your application initializes, it retrieves the last derived address index from local storage and re-derives all previously generated addresses. This ensures that the full set of addresses is available immediately on load, without requiring the user to re-derive each address manually.

Additionally, as new addresses are generated during your session, the provider updates the cached index to reflect the latest count. This seamless caching mechanism enhances performance and provides a smoother user experience by preserving the derivation state across sessions.

Simply wrap the component tree that requires these cached addresses with the `QubicLedgerAppDeriveredIndexCache` provider, and it will handle the caching logic behind the scenes.

```tsx
import { QubicLedgerAppProvider, QubicLedgerDemoModeProvider } from 'qubic-hw-app-react';

// Inside your component tree:
<QubicLedgerAppProvider derivationPath="m/44'/4218'/0'/0'">
    <QubicLedgerAppDeriveredIndexCache>{/* Components */}</QubicLedgerAppDeriveredIndexCache>
</QubicLedgerAppProvider>;
```

### Using the Use Qubic Ledger App Hook

The `useQubicLedgerApp` hook provides functions and state variables to interact with the Qubic Ledger:

```tsx
import { useQubicLedgerApp } from 'qubic-hw-app-react';

const {
    app,
    isAppInitialized,
    generatedAddresses,
    selectedAddress,
    isGeneratingAddress,
    initApp,
    getVersion,
    deriveNewAddress,
    selectAddressByIndex,
    clearSelectedAddress,
    reset,
} = useQubicLedgerApp();
```

#### Initializing the App

```tsx
const initAppHandler = async () => {
    try {
        await initApp();
        console.log('App initialized');
    } catch (e) {
        console.error('Failed to initialize app:', e.message);
    }
};
```

#### Deriving new address

```tsx
const deriveAddressHandler = async () => {
    try {
        const newAddress = await deriveNewAddress();
        console.log('Derived address:', newAddress);
    } catch (error) {
        console.error('Error deriving address:', error.message);
    }
};
```

#### Selecting an Address

```tsx
// Select the first generated address
selectAddressByIndex(0);
```

#### Getting Version Information

```tsx
const getVersionHandler = async () => {
    try {
        const versionResponse = await getVersion();
        console.log('Version info:', versionResponse);
    } catch (error) {
        console.error('Error loading version info:', error.message);
    }
};
```

## Hook Return Values

-   **`app`**: Instance of the Qubic Ledger app.
-   **`isAppInitialized`**: Boolean indicating if the app is initialized.
-   **`generatedAddresses`**: Array of generated addresses (includes `identity`, `publicKey`, etc.).
-   **`selectedAddress`**: Currently selected address (or `null`).
-   **`isGeneratingAddress`**: Boolean indicating if an address is being generated.
-   **`initApp`**: Function to initialize the Ledger app.
-   **`getVersion`**: Retrieves the hardware wallet's version.
-   **`deriveNewAddress`**: Generates a new address using the derivation path.
-   **`selectAddressByIndex`**: Selects an address from `generatedAddresses` by index.
-   **`clearSelectedAddress`**: Clears the currently selected address.
-   **`reset`**: Reset generated addresses (and selected address).

### Using the Qubic Ledger Sign Transaction hook:

> This requires wrapping your application with a QueryClientProvider from @tanstack/react-query.

The useQubicLedgerSignTransactionMutation hook allows signing transactions using the Qubic Ledger hardware wallet. It leverages react-query's useMutation to handle transaction signing as an asynchronous operation.

After calling `signTransaction`, the transaction will be displayed on the Ledger device, waiting for user confirmation before signing is completed.

#### Importing and Usage

```tsx
import { useQubicLedgerSignTransactionMutation } from 'qubic-hw-app-react';

const { mutateAsync: signTransaction } = useQubicLedgerSignTransactionMutation();

const handleSignTransaction = async (transaction) => {
    try {
        const signedTx = await signTransaction(transaction);
        console.log('Signed transaction:', signedTx);
    } catch (err) {
        console.error('Signing failed:', err.message);
    }
};
```

### Using Qubic RPC Service via hooks:

> This requires wrapping your application with a QueryClientProvider from @tanstack/react-query.

#### `useQubicCurrentTickQuery`

This hook retrieves the latest tick from the Qubic network.

```tsx
const { data, isLoading, error } = useQubicCurrentTickQuery();
```

-   `data`: Returns the latest tick as a number.

#### `useQubicRpcBroadcastTransactionMutation`

This hook broadcasts a transaction to the Qubic network.

```tsx
const { broadcastTransactionToRpc } = useQubicRpcBroadcastTransactionMutation();

const encodedTransaction = encodeTransactionToBase64(transaction);

const { transactionId } = await broadcastTransactionToRpc(encodedTransaction);
```

-   Returns a mutation object with `mutate`, `isLoading`, and `error` properties.
-   Mutation accepts a `QubicTransaction` or transaction hash string.

#### `useQubicTransactionHistoryQuery`

The useQubicTransactionHistoryQuery hook retrieves the transaction history for a given identity, starting from a specified tick. Transactions are fetched continuously as long as new ones are available.

```tsx
const { data, refetch, reset } = useQubicTransactionHistoryQuery(identity);
```

-   `data`: Contains the transaction history.
-   `refetch`: Manually triggers a refresh of the transaction history.
-   `reset`: Clears cached pages and refetches from the latest tick.

Transactions are fetched progressively, ensuring that all available transactions are retrieved without a predefined limit.

By using these hooks, your application can efficiently interact with the Qubic RPC API while leveraging React Query's caching and state management.

### Qsing the Qubic RPC Service

The library exports `QubicRpcService`, which provides a set of functions for interacting with the Qubic RPC API. This service handles network requests with validation, ensuring that responses match expected schemas. You can build your own hooks using the service.

#### Fetching Balance

Retrieve the balance of a given identity:

```tsx
import { QubicRpcService } from 'qubic-hw-app-react';

const fetchBalance = async (identity: string) => {
    try {
        const balance = await QubicRpcService.getBalance(identity);
        console.log('Balance:', balance);
    } catch (error) {
        console.error('Failed to fetch balance:', error.message);
    }
};
```

#### Fetching Current Tick

Get the latest tick from the Qubic network:

```tsx
const fetchCurrentTick = async () => {
    try {
        const latestTick = await QubicRpcService.getCurrentTick();
        console.log('Latest tick:', latestTick);
    } catch (error) {
        console.error('Failed to fetch latest tick:', error.message);
    }
};
```

#### Fetching Transactions

Retrieve transactions for an identity within a specific tick range:

```tsx
const fetchTransactions = async (identity: string, startTick: number) => {
    try {
        const transactions = await QubicRpcService.getTransactions({ identity, startTick });
        console.log('Transactions:', transactions);
    } catch (error) {
        console.error('Failed to fetch transactions:', error.message);
    }
};
```
