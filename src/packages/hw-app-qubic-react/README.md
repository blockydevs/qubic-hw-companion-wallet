# qubic-hw-app-react

A React hook and provider designed for seamless integration with the Qubic Ledger hardware wallet. This package leverages the robust **`Qubic Hardware Wallet App`** package to securely communicate with your Ledger device and is built on the reliable **`Qubic Typescript Library`**.

-   `qubic-hw-app` - <a href="" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Npm-logo.svg/2560px-Npm-logo.svg.png" alt="npm" width="35px" height="16px"></a>
    <a href="" target="_blank"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="github" width="30px" height="30px"></a>
-   `@qubic-lib/qubic-ts-library
` - <a href="https://www.npmjs.com/package/@qubic-lib/qubic-ts-library" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Npm-logo.svg/2560px-Npm-logo.svg.png" alt="npm" width="35px" height="16px"></a>
    <a href="https://github.com/qubic/ts-library/" target="_blank"><img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="github" width="30px" height="30px"></a>

## Known Limitations

-   Requires a WebHID-compatible browser (Chrome/Edge).
-   Demo mode generates dummy data and does not interact with a physical device.

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
-   **`initApp`**: Function to initialize the Ledger app. You can pass the event listeners config when initializating app.
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

#### Event Listeners

The package includes support for event listeners to handle key interactions with the Ledger device. Currently, it provides a listener for the `disconnect` event, ensuring your application remains stable if the device is unexpectedly disconnected.

##### Handling Ledger Disconnection

When the Ledger device disconnects during an active session, the package automatically resets the `app` and `transport` objects in the context state. This prevents errors caused by attempts to interact with a disconnected device and ensures a consistent application state.

##### Defining Event Listeners

You can specify event listeners during app initialization:

```tsx
await initApp({
    onDisconnect: () => {
        console.warn('Ledger device disconnected. Please reconnect the device to continue.');
    },
});
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


### Query Factory

The package provides a query factory utility for generating ready-to-use query objects compatible with [React Query](https://tanstack.com/query/latest/docs/framework/react/overview). This helps you easily fetch Qubic RPC data in a type-safe and consistent way.

#### Importing and Creating the Query Factory

```typescript
import { createQubicRpcQueryFactory } from 'qubic-hw-app-react';

const rpcUrl = 'https://your-rpc-url';
const apiUrl = 'https://your-api-url';
const queryFactory = createQubicRpcQueryFactory(rpcUrl, apiUrl);
```

#### Available Queries

The query factory currently includes:

- **getTransactions.forIdentity**: Fetches transactions for a given identity (address), with optional pagination.
- **currentTick**: Fetches the current tick from the Qubic network, with optional polling interval.

##### Query: getTransactions.forIdentity

Fetches transactions for a specific identity. Returns data matching the `transactionsForIdentitySchema` type.

**Usage Example:**

```typescript
import { useQuery } from '@tanstack/react-query';

const identity = 'QU...';
const { queryKey, queryFn } = queryFactory.getTransactions.forIdentity({ identity, offset: 0, size: 20 });
const { data, isLoading, error } = useQuery({ queryKey, queryFn });

// data will match the following schema:
// {
//   validForTick: number,
//   hits: { total: number, from: number, size: number },
//   transactions: Array<{
//     hash: string,
//     amount: string,
//     source: string,
//     destination: string,
//     tickNumber: number,
//     timestamp: string,
//     inputType: number,
//     inputSize: number,
//     inputData: string,
//     signature: string,
//     moneyFlew: boolean,
//   }>
// }
```

##### Query: currentTick

Fetches the current tick from the Qubic network. Returns a number (the current tick).

**Usage Example:**

```typescript
import { useQuery } from '@tanstack/react-query';

const { queryKey, queryFn, refetchInterval } = queryFactory.currentTick({ refreshInterval: 10000 });
const { data: currentTick, isLoading, error } = useQuery({ queryKey, queryFn, refetchInterval });

// currentTick will be a number (latest tick)
```

#### Notes

- All queries are compatible with React Query's `useQuery` hook.
- The query factory ensures correct query keys and functions for cache consistency and type safety.
- You can extend the factory with additional queries as needed.

See the [validation schemas](./src/utils/validation-schemas.ts) for detailed type definitions of the returned data.
