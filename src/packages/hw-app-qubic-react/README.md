# qubic-hw-app-react

A React hook and provider designed for seamless integration with the Qubic Ledger hardware wallet. This package leverages the robust **`qubic-hw-app`** package to securely communicate with your Ledger device and is built on the reliable Qubic Typescript Library.

<a href="" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Npm-logo.svg/2560px-Npm-logo.svg.png" alt="npm" width="30px" height="30px"></a>
<a href="" target="_blank"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="github" width="30px" height="30px"></a>

## Known Limitations

-   Requires a WebHID-compatible browser (Chrome/Edge).
-   Demo mode generates dummy data and does not interact with a physical device.

## Installation

To install the package, run:

```bash
npm install qubic-hw-app-react
```

### React Query Provider Requirement

To handle RPC calls efficiently, the library requires wrapping your application with a React Query provider. Ensure that your app is wrapped with `QueryClientProvider` from `@tanstack/react-query`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const App = () => (
    <QueryClientProvider client={queryClient}>
        <QubicLedgerAppProvider derivationPath="m/44'/4218'/0'/0'" rpcUrl='https://your-rpc-url'>
            <YourApp />
        </QubicLedgerDemoModeProvider>
    </QueryClientProvider>;
)
```

## Usage

### Using Demo Mode

To enable demo mode (for testing without a physical device), wrap your components with `QubicLedgerDemoModeProvider`. This generates dummy addresses when the device type is set to `demo`.

```tsx
import { QubicLedgerAppProvider, QubicLedgerDemoModeProvider } from 'qubic-hw-app-react';

// Inside your component tree:
<QubicLedgerAppProvider derivationPath="m/44'/4218'/0'/0'" rpcUrl='https://your-rpc-url'>
    <QubicLedgerDemoModeProvider>
        {/* Components requiring demo mode */}
    </QubicLedgerDemoModeProvider>
</QubicLedgerAppProvider>;
```

### Using Cached Derived Addresses

The `QubicLedgerAppDeriveredIndexCache` provider automatically manages the caching of derived address indexes in your browser's local storage. When your application initializes, it retrieves the last derived address index from local storage and re-derives all previously generated addresses. This ensures that the full set of addresses is available immediately on load, without requiring the user to re-derive each address manually.

Additionally, as new addresses are generated during your session, the provider updates the cached index to reflect the latest count. This seamless caching mechanism enhances performance and provides a smoother user experience by preserving the derivation state across sessions.

Simply wrap the component tree that requires these cached addresses with the `QubicLedgerAppDeriveredIndexCache` provider, and it will handle the caching logic behind the scenes.

```tsx
import { QubicLedgerAppProvider, QubicLedgerAppDeriveredIndexCache } from 'qubic-hw-app-react';

// Inside your component tree:
<QubicLedgerAppProvider derivationPath="m/44'/4218'/0'/0'" rpcUrl='https://your-rpc-url'>
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
    areBalanceLoading,
    selectAddressByIndex,
    refetchBalances,
    initApp,
    getVersion,
    deriveNewAddress,
    clearSelectedAddress,
    reset,
} = useQubicLedgerApp();
```

## Hook Return Values

-   **`app`**: Instance of the Qubic Ledger app.
-   **`isAppInitialized`**: Boolean indicating if the app is initialized.
-   **`generatedAddresses`**: Array of generated addresses (`IQubicLedgerAddress`.) .
-   **`selectedAddress`**: Currently selected address (or `null`).
-   **`isGeneratingAddress`**: Boolean indicating if a new address is being generated.
-   **`areBalanceLoading`**: Boolean indicating if balances are being loaded.
-   **`selectAddressByIndex`**: Function to set the selected address by index.
-   **`refetchBalances`**: Function to refetch balances for generated addresses.
-   **`initApp`**: Function to initialize the Ledger app.
-   **`getVersion`**: Function to retrieve the hardware wallet's version.
-   **`deriveNewAddress`**: Function to generate a new address using the derivation path.
-   **`clearSelectedAddress`**: Function to clear the currently selected address.
-   **`reset`**: Function to reset the app state.

#### Initializing the App

Initialize the Qubic Ledger app.

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

Generate a new address using the derivation path.

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

Set the selected address by index. The address has to be derivered from device first.

```tsx
// Select the first generated address
selectAddressByIndex(0);
```

#### Refetching Balances

Refetch balances for generated addresses.

```tsx
const refetchBalancesHandler = async () => {
    try {
        await refetchBalances();
        console.log('Balances refetched');
    } catch (error) {
        console.error('Error refetching balances:', error.message);
    }
};
```

#### Resetting the App

Reset the app state.

```tsx
const resetHandler = async () => {
    try {
        await reset();
        console.log('App reset');
    } catch (error) {
        console.error('Error resetting app:', error.message);
    }
};
```

#### Getting Version Information

Retrieve the hardware wallet's version.

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

#### Clearing Selected Address

Clear the currently selected address.

```tsx
const clearSelectedAddressHandler = () => {
    clearSelectedAddress();
    console.log('Selected address cleared');
};
```

### Using the Qubic Ledger Sign Transaction Hook

> This requires wrapping your application with a QueryClientProvider from @tanstack/react-query.

The `useQubicLedgerSignTransactionMutation` hook allows signing transactions using the Qubic Ledger hardware wallet. It leverages react-query's `useMutation` to handle transaction signing as an asynchronous operation.

After calling `signTransaction`, the transaction will be displayed on the Ledger device, waiting for user confirmation before signing is completed.

#### Importing and Usage

```tsx
import { useQubicLedgerSignTransactionMutation } from 'qubic-hw-app-react';

const {
    mutate: signTransaction,
    isLoading,
    isError,
    data,
} = useQubicLedgerSignTransactionMutation();

const handleSignTransaction = async (transaction) => {
    try {
        const signedTx = await signTransaction(transaction);
        console.log('Signed transaction:', signedTx);
    } catch (err) {
        console.error('Signing failed:', err.message);
    }
};
```

### Using Qubic RPC Service via Hooks

> This requires wrapping your application with a QueryClientProvider from @tanstack/react-query.

#### `useQubicRpcService`

This hook gives access to a single instance of the RPC service.

```ts
const qubicRpcService = useQubicRpcService();
```

#### `useQubicCurrentTickQuery`

This hook retrieves the latest tick from the Qubic network.

```tsx
const { data, isLoading, error } = useQubicCurrentTickQuery();
```

-   `data`: Returns the latest tick as a number.
-   rest of [`useQuery`](https://tanstack.com/query/v4/docs/framework/react/reference/useQuery) result

#### `useQubicRpcBroadcastTransactionMutation`

This hook broadcasts a transaction to the Qubic network.

```tsx
import {
    useQubicRpcBroadcastTransactionMutation,
    encodeTransactionToBase64,
} from 'qubic-hw-app-react';

const { mutateAsync: broadcastTransactionToRpc } = useQubicRpcBroadcastTransactionMutation();

const encodedTransaction = encodeTransactionToBase64(signedTransactionBytes);

const { transactionId } = await broadcastTransactionToRpc(encodedTransaction);
```

-   Returns a mutation object with `mutateAsync`, `isLoading`, `error` and rest [`useMutation`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation) return values.
-   Mutation accepts a `QubicTransaction` or transaction hash string.

#### `useQubicTransactionHistoryQuery`

The `useQubicTransactionHistoryQuery` hook retrieves the transaction history for a given identity, starting from a specified tick. Transactions are fetched continuously as long as new ones are available.

```tsx
const { data, refetch, reset, firstTick, endTick } = useQubicTransactionHistoryQuery(identity);
```

-   `firstTick`: The initial tick from which the transaction history starts.
-   `endTick`: The latest tick up to which the transactions have been fetched.
-   `data`: Contains the transaction history.
-   `refetch`: Fetch next chunk of transactions.
-   `reset`: Clears cached pages and refetches from the latest tick.
-   rest of [`useQuery`](https://tanstack.com/query/v4/docs/framework/react/reference/useQuery) result

Transactions are fetched progressively, ensuring that all available transactions are retrieved without a predefined limit.

#### How It Works

1. **Initialization**: The hook initializes with the provided `identity` and `initialTick`. It sets up the initial state for `firstTick` and `endTick`.

2. **Fetching Transactions**: The hook uses `useInfiniteQuery` to fetch transactions in batches. Each batch corresponds to a tick interval, defined by `tickInterval`. The `queryFn` fetches transactions for the specified identity within the tick range `[newStartTick, newEndTick]`.

3. **Pagination**: The `getNextPageParam` function determines if there are more transactions to fetch. It stops fetching when `endTick - tickInterval` is less than 0.

4. **State Management**: The hook manages the state of `firstTick` and `endTick` to keep track of the tick range for each batch of transactions.

### Using the Qubic RPC Service

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

### Utility Functions

#### Encoding Transactions to Base64

The `encodeTransactionToBase64` utility function converts a transaction (in `Uint8Array` format) to a Base64-encoded string.

```typescript
import { encodeTransactionToBase64 } from 'qubic-hw-app-react';

const transaction = new Uint8Array([
    /* transaction bytes */
]);
const encodedTransaction = encodeTransactionToBase64(transaction);
console.log('Encoded transaction:', encodedTransaction);
```
