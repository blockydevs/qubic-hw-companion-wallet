import React from 'react';
import { Skeleton, Text } from '@mantine/core';
import type { PolymorphicComponentProps, TextProps } from '@mantine/core';

export const LoadableText = ({
    children,
    hasError,
    isDataLoading,
    errorColor = 'red',
    errorText = 'Error fetching data',
    ...textProps
}: {
    hasError: boolean;
    errorColor?: string;
    errorText?: string;
    isDataLoading: boolean;
} & PolymorphicComponentProps<'text', TextProps>) => {
    if (isDataLoading) {
        return <Skeleton w='3rem' h='1rem' />;
    }

    if (hasError) {
        return (
            <Text {...textProps} c={errorColor}>
                {errorText}
            </Text>
        );
    }

    return (
        <Text c='gray' {...textProps}>
            {children}
        </Text>
    );
};
