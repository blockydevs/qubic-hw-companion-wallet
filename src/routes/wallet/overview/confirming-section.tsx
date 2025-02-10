import { Group, Notification, Text } from '@mantine/core';

export const ConfirmingSection = ({
    acceptingTxId,
    confirmingTxId,
    confirmationCount,
}: {
    acceptingTxId: string;
    confirmingTxId: string;
    confirmationCount: number;
}) => (
    <Group justify='space-between'>
        <Notification
            loading
            title={acceptingTxId ? 'Waiting for Acceptance' : 'Confirming Transaction'}
            withCloseButton={false}
        >
            <Text style={{ overflowWrap: 'break-word' }} fz={'0.8rem'}>
                {confirmingTxId} (Confirmations: {confirmationCount})
            </Text>
        </Notification>
    </Group>
);
