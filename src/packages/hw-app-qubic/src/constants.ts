/**
 * APDU Command Class (LEDGER_CLA)
 * - The class byte identifying the Ledger commands
 * @constant {number} LEDGER_CLA
 */
export const LEDGER_CLA = 0xe0;

/**
 * Instruction Codes (INS)
 * - Contains the available operations like getting the version,
 *   address, signing a transaction, and signing a message.
 * @constant {object} INS
 * @property {number} GET_VERSION - Get version of the Ledger device
 * @property {number} GET_ADDRESS - Get the wallet address
 * @property {number} SIGN_TRANSACTION - Sign a transaction
 * @property {number} SIGN_MESSAGE - Sign a message
 */
export const INS = {
    GET_VERSION: 0x04,
    GET_VERSION_FULL: 0x01,
    GET_PUBLIC_KEY: 0x05,
    SIGN_TRANSACTION: 0x06,
    SIGN_MESSAGE: 0x07,
} as const;

/**
 * P1 (Parameter 1) Flags for Operations
 * - Represents parameters related to confirmation and different stages of
 *   the transaction signing process (header, outputs, inputs, and signatures).
 * @constant {object} P1
 * @property {number} NON_CONFIRM - No confirmation required
 * @property {number} CONFIRM - Confirmation required
 * @property {number} HEADER - Header of the transaction
 * @property {number} OUTPUTS - Transaction outputs
 * @property {number} INPUTS - Transaction inputs
 * @property {number} NEXT_SIGNATURE - Next signature in the transaction
 */
export const P1 = {
    NON_CONFIRM: 0x00,
    CONFIRM: 0x01,
    HEADER: 0x00,
    OUTPUTS: 0x01,
    INPUTS: 0x02,
    NEXT_SIGNATURE: 0x03,
} as const;

/**
 * P2 (Parameter 2) Flags for Transaction Parts
 * - Specifies whether the current APDU command is the last part or
 *   if more parts follow, for multi-part operations like signing.
 * @constant {object} P2
 * @property {number} LAST - Last part of the command
 * @property {number} MORE - More parts follow
 */
export const P2 = {
    LAST: 0x00,
    MORE: 0x80,
} as const;
