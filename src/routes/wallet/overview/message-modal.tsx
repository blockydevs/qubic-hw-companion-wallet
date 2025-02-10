import { Modal, Stack, CopyButton, Button, Code, Text } from '@mantine/core';
import type { ModalProps } from '@mantine/core';

interface MessageModalProps extends ModalProps {
    message: string;
    signature: string;
}

export default function MessageModal({ message, signature, ...props }: MessageModalProps) {
    return (
        <Modal centered withCloseButton={true} size={'md'} title={'Message Signed'} {...props}>
            <Stack mt='md'>
                <Text size='h2'>Message:</Text>
                <Code block>{message}</Code>
                <Text size='h2'>Signature:</Text>
                <Code block>{signature}</Code>

                <CopyButton value={signature}>
                    {({ copied, copy }) => (
                        <Button color={copied ? 'grey' : 'brand'} onClick={copy}>
                            {copied ? 'Copied!' : 'Copy Signature'}
                        </Button>
                    )}
                </CopyButton>
            </Stack>
        </Modal>
    );
}
