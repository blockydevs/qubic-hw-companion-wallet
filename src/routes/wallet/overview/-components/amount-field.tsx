import { NumberInput, Text, UnstyledButton } from '@mantine/core';
import type { GetInputPropsReturnType } from '@mantine/form/lib/types';
import React from 'react';

export const AmountField = ({
    disabled,
    mantineFormInputProps,
    setMaxAmountHandler,
}: {
    mantineFormInputProps: GetInputPropsReturnType;
    setMaxAmountHandler: () => void;
    disabled: boolean;
}) => {
    return (
        <NumberInput
            label='Amount in QUBIC'
            placeholder='0'
            min={0}
            decimalScale={8}
            disabled={disabled}
            required
            rightSectionWidth='3rem'
            rightSection={
                <UnstyledButton aria-label='Set Max Amount' onClick={setMaxAmountHandler}>
                    <Text size='0.8rem' c='brand'>
                        MAX
                    </Text>
                </UnstyledButton>
            }
            {...mantineFormInputProps}
            inputWrapperOrder={['label', 'input', 'description', 'error']}
        />
    );
};
