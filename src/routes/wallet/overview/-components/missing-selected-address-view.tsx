import { Link } from 'react-router';
import { Button, Paper, Stack, Text, Title } from '@mantine/core';

export const MissingSelectedAddressView = () => (
    <Stack w='100%'>
        <Title size='h2'>Overview</Title>

        <Paper p='2rem' maw='660px'>
            <Stack align='center' ta='center' gap='lg'>
                <Title order={2} size='h3'>
                    No address selected
                </Title>

                <Text c='grey'>
                    Please go to the addresses page and select an address to view its details.
                </Text>

                <Link to='/wallet/addresses'>
                    <Button variant='outline'>Go to addresses</Button>
                </Link>
            </Stack>
        </Paper>
    </Stack>
);
