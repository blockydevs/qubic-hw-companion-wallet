import { Loader, LoadingOverlay, Paper, Stack, Text, Title } from '@mantine/core';

export const FullScreenLoader = ({
    visible,
    title,
    message,
}: {
    visible: boolean;
    title: string;
    message: string;
}) => {
    return (
        <LoadingOverlay
            visible={visible}
            pos='fixed'
            transitionProps={{ transition: 'fade', duration: 0.3 }}
            loaderProps={{
                children: (
                    <Paper bg='cardBackgroundTransaprent'>
                        <Stack justify='center' align='center' maw='625px' p='md'>
                            <Loader size='lg' />
                            <Stack gap='xs'>
                                <Title ta='center' component='p' size='h2'>
                                    {title}
                                </Title>
                                <Text
                                    ta='center'
                                    style={{
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    {message}
                                </Text>
                            </Stack>
                        </Stack>
                    </Paper>
                ),
            }}
            overlayProps={{
                color: 'black',
                radius: 'sm',
                blur: 2,
                zIndex: 399, // to be behind notification toasts
                p: 'sm',
            }}
        />
    );
};
