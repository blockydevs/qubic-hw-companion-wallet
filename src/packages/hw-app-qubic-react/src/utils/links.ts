export const produceLinkToTransactionExplorer = (txId: string) => {
    return `${process.env.REACT_APP_QUBIC_EXPLORER_BASE_URL}/${process.env.REACT_APP_QUBIC_EXPLORER_TRANSACTION_ENDPOINT}/${txId}`;
};
