import { Button, Tooltip } from '@mantine/core';
import type { ReactNode } from 'react';
import { AddressCardButtonWrapper } from './address-card-button-wrapper';

interface AddressCardButtonWithOnClickProps {
    isExternalLink?: false;
    component: ReactNode;
    label?: string;
    onClick: () => void;
    to?: never;
}

interface AddressCardButtonExternalLinkProps {
    isExternalLink: true;
    component: ReactNode;
    label?: string;
    onClick?: never;
    to: string;
}

export type AddressCardButtonProps =
    | AddressCardButtonWithOnClickProps
    | AddressCardButtonExternalLinkProps;

export const AddressCardButton = ({
    component,
    isExternalLink,
    label,
    onClick,
    to,
}: AddressCardButtonProps) => (
    <AddressCardButtonWrapper isExternalLink={isExternalLink} to={to}>
        <Tooltip label={label} position='bottom'>
            <Button variant='touch' onClick={onClick}>
                {component}
            </Button>
        </Tooltip>
    </AddressCardButtonWrapper>
);
