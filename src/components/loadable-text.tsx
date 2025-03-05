import React from 'react';
import { Skeleton, Text } from '@mantine/core';
import type { PolymorphicComponentProps, SkeletonProps, TextProps } from '@mantine/core';

export const LoadableText = ({
    children,
    hasError,
    isDataLoading,
    errorColor = 'red',
    errorText = 'Error fetching data',
    skeletonProps,
    ...textProps
}: {
    hasError: boolean;
    errorColor?: string;
    errorText?: string;
    isDataLoading: boolean;
    skeletonProps?: PolymorphicComponentProps<'div', SkeletonProps>;
} & PolymorphicComponentProps<'p' | 'span', TextProps>) => {
    if (isDataLoading) {
        return (
            <Skeleton
                w={skeletonProps?.w ?? '6rem'}
                h={skeletonProps?.h ?? '1rem'}
                {...skeletonProps}
            />
        );
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
