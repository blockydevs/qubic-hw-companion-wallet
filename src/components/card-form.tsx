import { Button, Stack, StackProps } from '@mantine/core';

interface CardFormProps extends Omit<StackProps, 'onSubmit'> {
    onSubmit: () => void;
    isSubmitButtonDisabled?: boolean;
    submitButtonLabel: string;
}

export const CardForm = ({
    isSubmitButtonDisabled,
    submitButtonLabel,
    onSubmit,
    children,
    ...stackProps
}: CardFormProps) => {
    return (
        <Stack {...stackProps}>
            {children}

            <Button fullWidth onClick={onSubmit} disabled={isSubmitButtonDisabled}>
                {submitButtonLabel}
            </Button>
        </Stack>
    );
};
