import { useCallback } from 'react';
import {
    Button,
    Flex,
    NumberInput,
    Stack,
    StackProps,
    Text,
    TextInput,
    Tooltip,
    UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import RefreshIcon from '@mui/icons-material/Refresh';
import { generateValidateOptions, sendFormSubmitHandler } from './send-form.utils';
import { useInitializeTick } from './send-form.hooks';

interface SendFormWithTickFieldProps extends Omit<StackProps, 'onSubmit'> {
    isDisabled?: boolean;
    maxAmount: number;
    transactionTickOffset: number;
    latestTick: number;
    selectedAddressIdentity: string;

    submitButtonLabel: string;
    onSubmit: (result: {
        amount: number;
        sendTo: string;
        type: 'with-tick-field';
        tick: number;
        resetForm: () => void;
    }) => void;

    setMaxAmountHandler: (setMaxAmount: (amount: number) => void) => void;
    onRefreshTick: () => void;
}

export const SendFormWithTickField = ({
    onSubmit,
    onRefreshTick,
    setMaxAmountHandler,
    submitButtonLabel,
    selectedAddressIdentity,
    isDisabled,
    transactionTickOffset,
    maxAmount,
    latestTick,
    ...stackProps
}: SendFormWithTickFieldProps) => {
    const { targetTransactionTick } = useInitializeTick({
        latestTick,
        transactionTickOffset,
        onTickChangeHandler: () => {},
    });

    const form = useForm({
        initialValues: {
            amount: 0,
            tick: targetTransactionTick,
            sendTo: '',
        },
        validate: generateValidateOptions({
            maxAmount,
            selectedAddressIdentity,
            type: 'with-tick-field',
            latestTick,
        }),
        validateInputOnBlur: true,
    });

    const onTickChangeHandler = useCallback(() => {
        form.setValues({
            tick: latestTick + parseInt(process.env.REACT_APP_TRANSACTION_TICK_OFFSET),
        });
    }, [latestTick, form.setValues]);

    const onRefreshTickHandler = useCallback(() => {
        onRefreshTick();
        form.setValues({ tick: latestTick });
    }, [onRefreshTick, latestTick]);

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
                        type: 'with-tick-field',
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
                        onClick={() => {
                            setMaxAmountHandler((amount) =>
                                form.setValues({
                                    amount,
                                }),
                            );
                        }}
                    >
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
                        <Flex gap='0.2rem' align='center'>
                            <Tooltip
                                label={`Click to set tick to ${latestTick} + ${process.env.REACT_APP_TRANSACTION_TICK_OFFSET}`}
                                position='bottom'
                            >
                                <Button
                                    variant='transparent'
                                    h='max-content'
                                    c='brand'
                                    p='0'
                                    onClick={onTickChangeHandler}
                                >
                                    {latestTick}
                                </Button>
                            </Tooltip>
                            <Tooltip label='Click to update latest tick' position='bottom'>
                                <Button variant='touch' p='0.15rem' onClick={onRefreshTickHandler}>
                                    <RefreshIcon
                                        sx={{ fontSize: '1rem' }}
                                        htmlColor='var(--mantine-color-brand-filled)'
                                    />
                                </Button>
                            </Tooltip>
                        </Flex>
                    </Stack>
                }
                {...form.getInputProps('tick')}
                inputWrapperOrder={['label', 'input', 'description', 'error']}
            />

            <Button fullWidth onClick={onSubmitHandler} disabled={isDisabled}>
                {submitButtonLabel}
            </Button>
        </Stack>
    );
};
