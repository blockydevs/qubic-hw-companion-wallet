const removeAddressIndexFromDerivationPath = (derivationPath: string) => {
    return derivationPath.split('/').slice(0, -1).join('/');
};

export const getAddressFromDerivationPathByIndex = (derivationPath: string, index = 1) => {
    return `${removeAddressIndexFromDerivationPath(derivationPath)}/${index}`;
};
