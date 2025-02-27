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

interface SendFormProps extends Omit<StackProps, 'onSubmit'> {
    // TODO: set correct typing
    isDisabled?: boolean;
    maxAmount: number;
    onSubmit: (result: { amount: number; sendTo: string; resetForm: () => void }) => void;
}

export const SendForm = ({ onSubmit, isDisabled, maxAmount, ...stackProps }: SendFormProps) => {
    const form = useForm({
        initialValues: {
            amount: 0,
            sendTo: '',
        },
        validate: {
            amount: (value) => (!(Number(value) > 0) ? 'Amount must be greater than 0' : null),
            sendTo: (value) => (typeof value !== 'string' ? 'Invalid address' : null),
        },
        validateInputOnBlur: true,
    });

    const canSendAmount = maxAmount > form.getValues().amount;

    const setMaxAmount = () => {
        form.setValues({
            amount: maxAmount,
        });
    };

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
                step={0.00000001}
                disabled={isDisabled}
                required
                {...form.getInputProps('amount')}
                rightSectionWidth={'3rem'}
                rightSection={
                    <UnstyledButton aria-label='Set Max Amount' onClick={setMaxAmount}>
                        <Text size='0.8rem' c={'brand'}>
                            MAX
                        </Text>
                    </UnstyledButton>
                }
                inputWrapperOrder={['label', 'input', 'description', 'error']}
            />

            <Button
                fullWidth
                onClick={() =>
                    onSubmit({
                        ...form.getValues(),
                        resetForm: form.reset,
                    })
                }
                disabled={isDisabled || !canSendAmount || !form.isValid()}
            >
                Sign with Ledger and Send {form.isValid()}
            </Button>
        </Stack>
    );
};
