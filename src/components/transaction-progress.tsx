import { Progress, ProgressRootProps } from '@mantine/core';

interface Props {
    currentTick: number;
    targetTick: number;
    status: React.ReactNode;
    progressColor?: string;
    className?: string;
}

const exaggerateProgress = (current: number, target: number): number => {
    const distance = target - current;

    if (distance <= 0) {
        return 99;
    }

    if (distance > 100) {
        return Math.floor((target / current) * 100);
    }

    const result = Math.floor(100 - distance);

    if (result === 100) {
        return 99;
    }

    return result;
};

export const TransactionProgress = ({
    currentTick,
    targetTick,
    status,
    progressColor = 'brand',
    ...props
}: Props & ProgressRootProps) => {
    const progress = status === 'pending' ? exaggerateProgress(currentTick, targetTick) : 100;
    const label = `${Math.floor(progress)}% `;

    return (
        <Progress.Root size='xl' {...props}>
            <Progress.Section value={progress} color={progressColor}>
                <Progress.Label>{label}</Progress.Label>
            </Progress.Section>

            {status !== 'Success' && status !== 'Failed' && (
                <Progress.Section value={100 - progress} color='gray'>
                    <Progress.Label>{targetTick - currentTick} ticks remaining</Progress.Label>
                </Progress.Section>
            )}
        </Progress.Root>
    );
};
