# Qubic HW Companion Wallet

Qubic HW Companion Wallet is a frontend dApp that interacts with the Qubic blockchain using a Ledger device for signing transactions. It leverages the [`hw-app-qubic-react`](src/packages/hw-app-qubic-react/README.md) package to provide seamless integration with the Ledger hardware wallet.

## Environment Variables

The application relies on the following environment variables for configuration:

-   `REACT_APP_IS_DEMO_MODE="true"`
    Enables or disables the demo mode. When set to `true`, users can explore the application without connecting a Ledger device.

-   `REACT_APP_QUBIC_DERIVATION_PATH="m/44'/1'/0'/0/0"`
    Specifies the derivation path for generating wallet addresses on the Ledger app.

-   `REACT_APP_QUBIC_RPC_URL="https://rpc.qubic.org/"`
    Defines the RPC endpoint for communicating with the blockchain.

-   `REACT_APP_TRANSACTION_TICK_OFFSET=10`
    Sets the default offset (in ticks) to be added to the current tick for transaction expiration. Used for setting a future tick as deadline.

-   `REACT_APP_QUBIC_TICK_FIELD_VISIBLE=false`
    Controls the visibility of the tick input field in the transaction form. When set to `false`, the tick field is hidden and calculated automatically.

-   `REACT_APP_QUBIC_TICK_REFRESH_INTERVAL=10000`
    Determines how often (in milliseconds) the app fetches and refreshes the current tick from the blockchain.

-   `REACT_APP_QUBIC_SHOW_TICK_SECONDS=true`
    When enabled (`true`), display time passed from the latest tick update.

- `REACT_APP_QUBIC_EXPLORER_BASE_URL="https://explorer.qubic.org"`
    URL For the Qubic explorer page.

- `REACT_APP_QUBIC_EXPLORER_ADDRESS_ENDPOINT="network/address"`
    Endpoint in the explorer to read address information

- `REACT_APP_QUBIC_EXPLORER_TRANSACTION_ENDPOINT="network/tx"`
  Endpoint in the explorer to read transaction information

## Compatible Browsers

The browser needs to support WebUSB/WebHID to interact with the Ledger device. These are the known compatible browsers:

-   Edge
-   Chrome

## Installation

To install the necessary packages, run:

```bash
npm install
```

## Development and Running Locally

You will need [NodeJS](https://nodejs.org/en) to run this locally.

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start using or developing Qubic locally.

## Functionalities

#### Home Page

On the home page, users can connect their Ledger device via USB or enter demo mode.

-   **Connect with USB**: Initializes the Qubic Ledger app and navigates to the wallet addresses page.
-   **Go to demo mode**: Sets the device type to demo and navigates to the wallet addresses page.

#### Wallet Addresses Page

On the wallet addresses page, users can generate new addresses, select an address, and view address details.

-   **Generate New Address**: Derives a new address using the Ledger device.
-   **Select Address**: Sets the selected address by index.
-   **View Address Details**: Displays the address details including balance and verification status.
-   **Hide Sensitive Data**: Blur sensitive data

Example:

```tsx
const {
    generatedAddresses,
    deriveNewAddress,
    selectAddressByIndex,
    selectedAddress,
    isGeneratingAddress,
} = useQubicLedgerApp();

const handleGenerateNewAddress = () => {
    deriveNewAddress();
};

const handleSelectAddress = (index) => {
    selectAddressByIndex(index);
};
```

#### Wallet Overview Page

On the wallet overview page, users can view their selected address, balance, and send transactions.

-   **View Selected Address**: Displays the selected address and its balance.
-   **Send Transactions**: Allows users to send transactions using the Ledger device for signing.

Example:

```tsx
const { selectedAddress } = useQubicLedgerApp();
const { mutateAsync: sendTransactionSignedWithLedgerToRpc } =
    useQubicSendTransactionSignedWithLedgerToRpc(latestTick);
const [isTransactionProcessing, setIsTransactionProcessing] = useState(false);

const onSubmitHandler = async (values: {
    sendTo: string;
    amount: number;
    tick: number;
    resetForm: () => void;
}) => {
    try {
        setIsTransactionProcessing(true);
        await sendTransactionSignedWithLedgerToRpc(values);
        setIsTransactionProcessing(false);
    } catch (error) {
        setIsTransactionProcessing(false);
    }
};
```
