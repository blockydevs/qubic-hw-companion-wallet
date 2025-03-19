import { useCallback, useEffect, useRef } from 'react';
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
import { z } from 'zod';
import { notifications } from '@mantine/notifications';

interface SendFormProps extends Omit<StackProps, 'onSubmit'> {
    isDisabled?: boolean;
    maxAmount: number;
    transactionTickOffset: number;
    latestTick: number;
    selectedAddressIdentity: string;

    submitButtonLabel: string;
    onSubmit: (result: {
        amount: number;
        sendTo: string;
        tick: number;
        resetForm: () => void;
    }) => void;
    onRefreshTick: () => void;
}

const validateWithZod = <Data extends unknown>(value: Data, schema: z.Schema<Data>) => {
    const result = schema.safeParse(value);

    return result.success ? null : JSON.parse(result.error.message)[0].message;
};

const ERROR_MESSAGE_TEMPLATES = {
    amountPositive: 'Amount must be greater than 0',
    amountLte: (maxAmount: number) => `Amount must be less than or equal to ${maxAmount}`,
    addressLength: 'Address must be 60 characters long',
    addressRegex: 'Address must contain only uppercase letters and numbers',
    addressSelf: 'Cannot send to your own address',
    tick: (latestTick: number) =>
        `Number must be greater than or equal to the latest tick (${latestTick})`,
};

const SUBMIT_ERROR_NOTIFICATION_TITLE = 'Form is not valid';

const ERRORS_ON_SUBMIT = {
    fillErrorsBeforeSubmitting: 'Please fill the form errors before submitting',
    fillFormBeforeSubmitting: 'Please fill the form before submitting',
};

export const SendForm = ({
    onSubmit,
    onRefreshTick,
    submitButtonLabel,
    selectedAddressIdentity,
    isDisabled,
    transactionTickOffset,
    maxAmount,
    latestTick,
    ...stackProps
}: SendFormProps) => {
    const isTickInitialized = useRef(false);

    const targetTransactionTick = transactionTickOffset + latestTick;

    const form = useForm({
        initialValues: {
            amount: 0,
            tick: targetTransactionTick,
            sendTo: '',
        },
        validate: {
            amount: (value) =>
                validateWithZod(
                    value,
                    z
                        .number()
                        .int()
                        .positive(ERROR_MESSAGE_TEMPLATES.amountPositive)
                        .lte(maxAmount, ERROR_MESSAGE_TEMPLATES.amountLte(maxAmount)),
                ),
            sendTo: (value) =>
                validateWithZod(
                    value,
                    z
                        .string()
                        .length(60, ERROR_MESSAGE_TEMPLATES.addressLength)
                        .regex(/^[A-Z0-9]+$/, ERROR_MESSAGE_TEMPLATES.addressRegex)
                        .refine((value) => value !== selectedAddressIdentity, {
                            message: ERROR_MESSAGE_TEMPLATES.addressSelf,
                        }),
                ),
            tick: (value) =>
                validateWithZod(
                    value,
                    z
                        .number({
                            errorMap: () => ({
                                message: ERROR_MESSAGE_TEMPLATES.tick(latestTick),
                            }),
                        })
                        .int()
                        .positive()
                        .gte(latestTick),
                ),
        },
        validateInputOnBlur: true,
    });

    const setMaxAmount = () => {
        form.setValues({
            amount: maxAmount,
        });
    };

    const onTickChangeHandler = useCallback(() => {
        form.setValues({
            tick: latestTick + 40,
        });
    }, [latestTick, form.setValues]);

    const onRefreshTickHandler = useCallback(() => {
        onRefreshTick();
        form.setValues({ tick: latestTick });
    }, [onRefreshTick, latestTick]);

    const onSubmitHandler = useCallback(() => {
        if (!form.isValid()) {
            const errorMessage =
                Object.keys(form.errors).length >= 1
                    ? ERRORS_ON_SUBMIT.fillErrorsBeforeSubmitting
                    : ERRORS_ON_SUBMIT.fillFormBeforeSubmitting;

            notifications.show({
                title: SUBMIT_ERROR_NOTIFICATION_TITLE,
                message: errorMessage,
                color: 'red',
            });

            return;
        }

        const validation = form.validate();

        if (validation.hasErrors) {
            notifications.show({
                title: SUBMIT_ERROR_NOTIFICATION_TITLE,
                message: ERRORS_ON_SUBMIT.fillErrorsBeforeSubmitting,
                color: 'red',
            });

            return;
        }

        onSubmit({
            ...form.getValues(),
            resetForm: form.reset,
        });
    }, [form.getValues, form.isValid, form.errors, form.validate, onSubmit]);

    useEffect(() => {
        // INITIALIZE TICK VALUE
        console.log('ghook');
        if (
            latestTick &&
            latestTick > 0 &&
            (Number.isNaN(form.getValues().tick) || form.getValues().tick === 0) &&
            !isTickInitialized.current
        ) {
            onTickChangeHandler();
            console.log('ghook init', latestTick);
            isTickInitialized.current = true;
        }
    }, [latestTick, form.getValues().tick, onTickChangeHandler]);

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
                                label={`Click to set tick to ${latestTick} + 40`}
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
