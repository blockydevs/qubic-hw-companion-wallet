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
import { QubicLedgerProvider } from 'qubic-hw-app-react';

<QubicLedgerProvider derivationPath="m/44'/4218'/0'/0'">
    {/* Your components go here */}
</QubicLedgerProvider>;
```

### Using Demo Mode

To enable demo mode (for testing without a physical device), wrap your components with `QubicLedgerDemoModeProvider`. This generates dummy addresses when the device type is set to `demo`.

```tsx
import { QubicLedgerProvider, QubicLedgerDemoModeProvider } from 'qubic-hw-app-react';

// Inside your component tree:
<QubicLedgerProvider derivationPath="m/44'/4218'/0'/0'">
    <QubicLedgerDemoModeProvider>
        {/* Components requiring demo mode */}
    </QubicLedgerDemoModeProvider>
</QubicLedgerProvider>;
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

// Clear selection
clearSelectedAddress();
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
