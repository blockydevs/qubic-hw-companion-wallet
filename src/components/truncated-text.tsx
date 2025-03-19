import { Text } from '@mantine/core';
import type { PolymorphicComponentProps, TextProps } from '@mantine/core';

interface TruncatedTextProps extends PolymorphicComponentProps<'text', TextProps> {
    charsFromBeginning?: number;
    charsFromEnd?: number;
    truncateText?: string;
    children: string | string[];
}

export const TruncatedText = ({
    charsFromBeginning = 5,
    charsFromEnd = 5,
    truncateText = '...',
    children,
    ...textProps
}: TruncatedTextProps) => {
    const childrenString = Array.isArray(children) ? children.join('') : children;

    const shouldTruncate =
        charsFromBeginning + charsFromEnd + truncateText.length < childrenString.length;

    if (shouldTruncate) {
        return (
            <Text {...textProps}>
                {childrenString.slice(0, charsFromBeginning)}
                {truncateText}
                {childrenString.slice(-charsFromEnd)}
            </Text>
        );
    }

    return <Text {...textProps}>{childrenString}</Text>;
};
