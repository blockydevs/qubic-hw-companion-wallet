import { z } from "zod";
import { P1, P2, INS, LEDGER_CLA } from "./constants";
import { StatusCodes } from "@ledgerhq/hw-transport";

export const schemaP1 = z
    .custom<(typeof P1)[keyof typeof P1]>()
    .superRefine((value, ctx) => {
        const availableValues = Object.values(P1);

        for (const val of availableValues) {
            if (val === value) {
                return true;
            }
        }

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid P1 value. Available values: ${availableValues.join(
                ", "
            )}`,
        });

        return false;
    });

export const schemaP2 = z
    .custom<(typeof P2)[keyof typeof P2]>()
    .superRefine((value, ctx) => {
        const availableValues = Object.values(P2);

        for (const val of availableValues) {
            if (val === value) {
                return true;
            }
        }

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid P2 value. Available values: ${availableValues.join(
                ", "
            )}`,
        });

        return false;
    });

export const schemaInstruction = z
    .custom<(typeof INS)[keyof typeof INS]>()
    .superRefine((value, ctx) => {
        const availableInstructions = Object.values(INS);

        for (const ins of availableInstructions) {
            if (ins === value) {
                return true;
            }
        }

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid instruction. Available instructions: ${availableInstructions.join(
                ", "
            )}`,
        });

        return false;
    });

export const schemaCla = z
    .custom<typeof LEDGER_CLA>()
    .superRefine((value, ctx) => {
        if (value === LEDGER_CLA) {
            return true;
        }

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid Ledger CLA value. Expected: ${LEDGER_CLA}`,
        });

        return false;
    });

export const schemaStatusCodes = z
    .custom<(typeof StatusCodes)[keyof typeof StatusCodes]>()
    .superRefine((value, ctx) => {
        const availableStatusCodes = Object.values(StatusCodes);

        for (const code of availableStatusCodes) {
            if (code === value) {
                return true;
            }
        }

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid status code. Available status codes: ${availableStatusCodes.join(
                ", "
            )}`,
        });

        return false;
    });

export const schemaSendToDeviceParams = z.object({
    instruction: schemaInstruction,
    p1: schemaP1,
    p2: schemaP2.optional(),
    payload: z.instanceof(Buffer).optional(),
});
