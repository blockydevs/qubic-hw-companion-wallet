import { Group, Notification, Text } from '@mantine/core';
import { IconReplace } from '@tabler/icons-react';

interface ReplacingTransactionSectionProps {
    onCloseNotification?: () => void;
    transactionId: string;
}

export const ReplacingTransactionSection = ({
    onCloseNotification,
    transactionId,
}: ReplacingTransactionSectionProps) => (
    <Group justify='space-between'>
        <Notification
            title='Replacing Transaction'
            icon={<IconReplace size={16} />}
            onClose={onCloseNotification}
        >
            <Text style={{ overflowWrap: 'break-word' }} fz={'0.8rem'}>
                {transactionId}
            </Text>
        </Notification>
    </Group>
);
