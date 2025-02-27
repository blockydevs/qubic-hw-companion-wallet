import { useCallback, useEffect } from 'react';
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
    onRefreshTick: () => void;
}

const validateWithZod = <Data extends unknown>(value: Data, schema: z.Schema<Data>) => {
    const result = schema.safeParse(value);

    return result.success ? null : JSON.parse(result.error.message)[0].message;
};

export const SendForm = ({
    onSubmit,
    onRefreshTick,
    submitButtonLabel,
    isDisabled,
    maxAmount,
    latestTick,
    ...stackProps
}: SendFormProps) => {
    const form = useForm({
        initialValues: {
            amount: 0,
            tick: latestTick + 40,
            sendTo: '',
        },
        validate: {
            amount: (value) => validateWithZod(value, z.number().int().positive().lte(maxAmount)),
            sendTo: (value) =>
                validateWithZod(
                    value,
                    z
                        .string()
                        .length(60)
                        .regex(/^[A-Z0-9]+$/),
                ),
            tick: (value) => validateWithZod(value, z.number().int().positive().gte(latestTick)),
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

    useEffect(() => {
        // INITIALIZE TICK VALUE
        if (
            latestTick !== 0 &&
            (Number.isNaN(form.getValues().tick) || latestTick > form.getValues().tick)
        ) {
            onTickChangeHandler();
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

            <Button
                fullWidth
                onClick={() =>
                    onSubmit({
                        ...form.getValues(),
                        resetForm: form.reset,
                    })
                }
                disabled={isDisabled || !form.isValid()}
            >
                {submitButtonLabel}
            </Button>
        </Stack>
    );
};
