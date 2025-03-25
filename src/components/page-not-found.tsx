import React from 'react';
import { Link } from 'react-router';
import { Stack, Title, Button, Center } from '@mantine/core';

export const PageNotFound = () => {
    return (
        <Stack w='100%' gap='xl'>
            <Center>
                <Stack align='center' ta='center'>
                    <Title component='p' size='h2'>
                        Page not found
                    </Title>

                    <Stack>
                        Return to home page
                        <Link to='/'>
                            <Button>Home page</Button>
                        </Link>
                    </Stack>
                </Stack>
            </Center>
        </Stack>
    );
};
