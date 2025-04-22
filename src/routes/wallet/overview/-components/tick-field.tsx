import { Button, Flex, NumberInput, Stack, Text, Tooltip } from '@mantine/core';
import { GetInputPropsReturnType } from '@mantine/form/lib/types';
import RefreshIcon from '@mui/icons-material/Refresh';

export const TickField = ({
    disabled,
    latestTick,
    tickOffset,
    refetchTickValue,
    mantineFormInputProps,
}: {
    mantineFormInputProps: GetInputPropsReturnType;
    latestTick: number;
    tickOffset: number;
    refetchTickValue: () => void;
    disabled: boolean;
}) => {
    return (
        <NumberInput
            label='Tick'
            placeholder='0'
            decimalScale={8}
            step={1}
            disabled={disabled}
            required
            rightSectionWidth='6rem'
            rightSection={
                <Stack display='flex' dir='column' gap='0' justify='flex-end' align='flex-end'>
                    <Text pl='1rem' size='xs'>
                        Latest tick:
                    </Text>
                    <Flex gap='0.2rem' align='center'>
                        <Tooltip
                            label={`Click to set tick to ${latestTick} + ${tickOffset}`}
                            position='bottom'
                        >
                            <Button
                                variant='transparent'
                                h='max-content'
                                c='brand'
                                p='0'
                                onClick={() => {
                                    refetchTickValue();
                                }}
                            >
                                {latestTick}
                            </Button>
                        </Tooltip>
                        <Tooltip label='Click to update latest tick' position='bottom'>
                            <Button
                                variant='touch'
                                p='0.15rem'
                                onClick={() => {
                                    refetchTickValue();
                                }}
                            >
                                <RefreshIcon
                                    sx={{ fontSize: '1rem' }}
                                    htmlColor='var(--mantine-color-brand-filled)'
                                />
                            </Button>
                        </Tooltip>
                    </Flex>
                </Stack>
            }
            {...mantineFormInputProps}
            inputWrapperOrder={['label', 'input', 'description', 'error']}
        />
    );
};
