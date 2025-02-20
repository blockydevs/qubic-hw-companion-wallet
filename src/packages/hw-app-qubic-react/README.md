# qubic-hw-app-react

This package provides a React hook and provider to interact with the Qubic Ledger hardware wallet. Below are the instructions on how to set up and use the package.

## Installation

To install the package, run:

```bash
npm install qubic-hw-app-react
```

## Usage

### Wrapping with Provider

First, wrap your application with the `QubicLedgerProvider`. This ensures that the Qubic Ledger context is available throughout your application.

```tsx
import { QubicLedgerAppProvider } from 'qubic-hw-app-react';

<QubicLedgerAppProvider derivationPath="m/44'/4218'/0'/0'">
    {/* Your components go here */}
</QubicLedgerAppProvider>;
```

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
    <QubicLedgerAppDeriveredIndexCache>
        {/* Components */}
    </QubicLedgerAppDeriveredIndexCache>
</QubicLedgerAppProvider>;
```

### Using the Hook

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

### Hook Return Values

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

## Known Limitations

-   Requires a WebHID-compatible browser (Chrome/Edge).
-   Demo mode generates dummy data and does not interact with a physical device.
