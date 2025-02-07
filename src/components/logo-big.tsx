import { Image, useMantineColorScheme } from '@mantine/core';
import React from 'react';

export const LogoBig = () => {
    const { colorScheme } = useMantineColorScheme();

    return (
        <Image
            src={colorScheme === 'light' ? '/Qubic-Logo-Dark.svg' : '/Qubic-Symbol-White.svg'}
            alt='Qubic'
            width={180}
            height={180}
        />
    );
};
