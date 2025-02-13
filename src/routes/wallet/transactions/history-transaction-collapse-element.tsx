import { Group, Text } from '@mantine/core';

interface HistoryTransactionCollapseElementProps {
    label: string;
    component: React.ReactNode;
}

export const HistoryTransactionCollapseElement = ({
    label,
    component,
}: HistoryTransactionCollapseElementProps) => (
    <Group justify='space-between' w='100%'>
        <Text c='grey'>{label}</Text>
        <Group gap='0.25rem'>{component}</Group>
    </Group>
);
