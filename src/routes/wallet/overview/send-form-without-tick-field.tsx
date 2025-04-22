import { useCallback } from 'react';
import {
    Button,
    NumberInput,
    Stack,
    StackProps,
    Text,
    TextInput,
    UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
    generateValidateOptions,
    sendFormSubmitHandler,
} from '@/routes/wallet/overview/send-form.utils';

interface SendFormWithoutTickProps extends Omit<StackProps, 'onSubmit'> {
    isDisabled?: boolean;
    maxAmount: number;
    selectedAddressIdentity: string;

    submitButtonLabel: string;
    onSubmit: (result: {
        amount: number;
        sendTo: string;
        resetForm: () => void;
        type: 'without-tick-field';
    }) => void;

    setMaxAmountHandler: (setMaxAmount: (amount: number) => void) => void;
}

export const SendFormWithoutTick = ({
    onSubmit,
    setMaxAmountHandler,
    submitButtonLabel,
    selectedAddressIdentity,
    isDisabled,
    maxAmount,
    ...stackProps
}: SendFormWithoutTickProps) => {
    const form = useForm({
        initialValues: {
            amount: 0,
            sendTo: '',
        },
        validate: generateValidateOptions({
            maxAmount,
            selectedAddressIdentity,
            type: 'without-tick-field',
        }),
        validateInputOnBlur: true,
    });

    const onSubmitHandler = useCallback(
        () =>
            sendFormSubmitHandler({
                formErrors: form.errors,
                formReset: form.reset,
                isFormValid: form.isValid(),
                validateForm: form.validate,
                formValues: form.values,
                onFormSubmit: () =>
                    onSubmit({
                        ...form.getValues(),
                        resetForm: form.reset,
                        type: 'without-tick-field',
                    }),
            }),
        [
            form.errors,
            form.isValid,
            form.validate,
            form.values,
            onSubmit,
            form.reset,
            form.getValues,
        ],
    );

    return (
        <Stack {...stackProps}>
            <TextInput
                label='Send to Address'
                placeholder='Address'
                {...form.getInputProps('sendTo')}
                disabled={isDisabled}
                required
            />

            <NumberInput
                label='Amount in QUBIC'
                placeholder='0'
                min={0}
                decimalScale={8}
                disabled={isDisabled}
                required
                {...form.getInputProps('amount')}
                rightSectionWidth={'3rem'}
                rightSection={
                    <UnstyledButton
                        aria-label='Set Max Amount'
                        onClick={() =>
                            setMaxAmountHandler((amount) =>
                                form.setValues({
                                    amount,
                                }),
                            )
                        }
                    >
                        <Text size='0.8rem' c={'brand'}>
                            MAX
                        </Text>
                    </UnstyledButton>
                }
                inputWrapperOrder={['label', 'input', 'description', 'error']}
            />

            <Button fullWidth onClick={onSubmitHandler} disabled={isDisabled}>
                {submitButtonLabel}
            </Button>
        </Stack>
    );
};
