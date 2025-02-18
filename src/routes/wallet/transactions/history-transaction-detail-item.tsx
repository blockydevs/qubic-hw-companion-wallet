import { Group, Text } from '@mantine/core';

interface HistoryTransactionDetailItemProps {
    label: string;
    component: React.ReactNode;
}

export const HistoryTransactionDetailItem = ({
    label,
    component,
}: HistoryTransactionDetailItemProps) => (
    <Group justify='space-between' w='100%'>
        <Text c='grey'>{label}</Text>
        <Group gap='0.25rem'>{component}</Group>
    </Group>
);
