import { Box } from '@mantine/core';
import { QRCodeSVG } from 'qrcode.react';

interface QrCodeProps {
    value: string;
    title: string;
}

export const QrCode = ({ value, title }: QrCodeProps) => {
    return (
        <Box
            bd={'4px solid var(--mantine-color-brand-text)'}
            style={{ borderRadius: '0.25rem' }}
            w='max-content'
        >
            <QRCodeSVG
                value={value}
                title={title}
                size={256}
                bgColor={'#000'}
                fgColor={'var(--mantine-color-brand-text)'}
                level={'L'}
                imageSettings={{
                    src: '/Qubic-Symbol-White.svg',
                    x: undefined,
                    y: undefined,
                    height: 32,
                    width: 32,
                    opacity: 1,
                    excavate: true,
                }}
            />
        </Box>
    );
};
