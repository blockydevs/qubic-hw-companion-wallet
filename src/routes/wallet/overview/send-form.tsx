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
import { useEffect } from 'react';

interface SendFormProps extends Omit<StackProps, 'onSubmit'> {
    isDisabled?: boolean;
    maxAmount: number;
    latestTick: number;

    submitButtonLabel: string;
    onSubmit: (result: {
        amount: number;
        sendTo: string;
        tick: number;
        resetForm: () => void;
    }) => void;
}

export const SendForm = ({
    onSubmit,
    submitButtonLabel,
    isDisabled,
    maxAmount,
    latestTick,
    ...stackProps
}: SendFormProps) => {
    const form = useForm({
        initialValues: {
            amount: 0,
            tick: latestTick + 10,
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

    useEffect(() => {
        if (latestTick > form.getValues().tick) {
            form.setValues({
                tick: latestTick + 10,
            });
        }
    }, [latestTick, form.getValues().tick, form.setValues, form.getValues, form.getValues().tick]);

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

            <NumberInput
                label='Tick'
                placeholder='0'
                min={latestTick}
                decimalScale={8}
                step={1}
                disabled={isDisabled}
                required
                rightSectionWidth='6rem'
                rightSection={
                    <Stack display='flex' dir='column' gap='0' justify='flex-end' align='flex-end'>
                        <Text pl='1rem' size='xs'>
                            Latest tick:
                        </Text>
                        <Text size='xs' c='brand'>
                            {latestTick}
                        </Text>
                    </Stack>
                }
                {...form.getInputProps('tick')}
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
                {submitButtonLabel}
            </Button>
        </Stack>
    );
};
