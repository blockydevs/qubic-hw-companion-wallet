export const convertDerivationPathToBuffer = (derivationPath: string) => {
    const split = derivationPath.split('/');

    if (split[0] !== 'm') {
        throw new Error('Error master expected');
    }

    const parts = split.slice(1);

    let pathBytes = Buffer.alloc(1, parts.length); // First byte is count of path components

    for (const value of parts) {
        if (value === '') {
            throw new Error(`Error missing value in split list "${split}"`);
        }

        let num: number;
        if (value.endsWith("'")) {
            num = parseInt(value.slice(0, -1), 10);
            num |= 0x80000000; // Apply BIP32 hardening
        } else {
            num = parseInt(value, 10);
        }

        const componentBuffer = Buffer.alloc(4);
        componentBuffer.writeUInt32BE(num >>> 0, 0); // >>> 0 ensures unsigned
        pathBytes = Buffer.concat([pathBytes, componentBuffer]);
    }

    return pathBytes;
};
