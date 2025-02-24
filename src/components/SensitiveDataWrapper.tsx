import { Stack } from '@mantine/core';
import type { BoxComponentProps, PolymorphicComponentProps } from '@mantine/core';

interface SensitiveDataWrapperProps extends PolymorphicComponentProps<'div', BoxComponentProps> {
    isSensitiveDataHidden: boolean;
}

export const SensitiveDataWrapper = ({
    children,
    isSensitiveDataHidden,
}: SensitiveDataWrapperProps) => {
    return (
        <Stack
            pos='relative'
            style={{
                overflow: 'visible',
                filter: `blur(${isSensitiveDataHidden ? 13 : 0}px)`,
                transition: ' 0.13s filter ease',
            }}
        >
            {children}
        </Stack>
    );
};
