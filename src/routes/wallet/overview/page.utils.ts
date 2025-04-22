import { FormErrors } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';

interface SendFormValidationOptionsBase {
    maxAmount: number;
    selectedAddressIdentity: string;
}

interface SendFormValidationOptionsWithTickField extends SendFormValidationOptionsBase {
    latestTick: number;
    type: 'with-tick-field';
}

interface SendFormValidationOptionsWithoutTickField extends SendFormValidationOptionsBase {
    type: 'without-tick-field';
}

export const ERROR_MESSAGE_TEMPLATES = {
    amountPositive: 'Amount must be greater than 0',
    amountLte: (maxAmount: number) => `Amount must be less than or equal to ${maxAmount}`,
    addressLength: 'Address must be 60 characters long',
    addressRegex: 'Address must contain only uppercase letters and numbers',
    addressSelf: 'Cannot send to your own address',
    tick: (latestTick: number) =>
        `Number must be greater than or equal to the latest tick (${latestTick})`,
};

export const SUBMIT_ERROR_NOTIFICATION_TITLE = 'Form is not valid';

export const ERRORS_ON_SUBMIT = {
    fillErrorsBeforeSubmitting: 'Please fill the form errors before submitting',
    fillFormBeforeSubmitting: 'Please fill the form before submitting',
};

const validateWithZod = <Data extends unknown>(value: Data, schema: z.Schema<Data>) => {
    const result = schema.safeParse(value);

    return result.success ? null : JSON.parse(result.error.message)[0].message;
};

export const generateValidateOptions = (
    props: SendFormValidationOptionsWithTickField | SendFormValidationOptionsWithoutTickField,
) => ({
    amount: (value) =>
        validateWithZod(
            value,
            z
                .number()
                .int()
                .positive(ERROR_MESSAGE_TEMPLATES.amountPositive)
                .lte(props.maxAmount, ERROR_MESSAGE_TEMPLATES.amountLte(props.maxAmount)),
        ),
    sendTo: (value) =>
        validateWithZod(
            value,
            z
                .string()
                .length(60, ERROR_MESSAGE_TEMPLATES.addressLength)
                .regex(/^[A-Z0-9]+$/, ERROR_MESSAGE_TEMPLATES.addressRegex)
                .refine((value) => value !== props.selectedAddressIdentity, {
                    message: ERROR_MESSAGE_TEMPLATES.addressSelf,
                }),
        ),
    ...(props.type === 'with-tick-field'
        ? {
              tick: (value) =>
                  validateWithZod(
                      value,
                      z
                          .number({
                              errorMap: () => ({
                                  message: ERROR_MESSAGE_TEMPLATES.tick(props.latestTick),
                              }),
                          })
                          .int()
                          .positive()
                          .gte(props.latestTick),
                  ),
          }
        : {}),
});

export const sendFormSubmitHandler = ({
    formValues,
    formErrors,
    isFormValid,
    validateForm,
    formReset,
    onFormSubmit,
}: {
    formValues: { amount: number; sendTo: string };
    formErrors: FormErrors;
    isFormValid: boolean;
    validateForm: () => { hasErrors: boolean };
    formReset: () => void;
    onFormSubmit: (values: { amount: number; sendTo: string; resetForm: () => void }) => void;
}) => {
    if (!isFormValid) {
        const errorMessage =
            Object.keys(formErrors).length >= 1
                ? ERRORS_ON_SUBMIT.fillErrorsBeforeSubmitting
                : ERRORS_ON_SUBMIT.fillFormBeforeSubmitting;

        notifications.show({
            title: SUBMIT_ERROR_NOTIFICATION_TITLE,
            message: errorMessage,
            color: 'red',
        });

        return;
    }

    const validation = validateForm();

    if (validation.hasErrors) {
        notifications.show({
            title: SUBMIT_ERROR_NOTIFICATION_TITLE,
            message: ERRORS_ON_SUBMIT.fillErrorsBeforeSubmitting,
            color: 'red',
        });

        return;
    }

    onFormSubmit({
        ...formValues,
        resetForm: formReset,
    });
};
