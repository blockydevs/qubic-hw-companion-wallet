export const encodeTransactionToBase64 = (transaction: Uint8Array): string => {
    const byteArray = new Uint8Array(transaction);
    const str = String.fromCharCode.apply(null, byteArray);

    return btoa(str);
};
