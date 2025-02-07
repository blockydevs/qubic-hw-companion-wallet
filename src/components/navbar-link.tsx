import React from 'react';
import { Link, useLocation } from 'react-router';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import Face5Icon from '@mui/icons-material/Face5';
import BoltIcon from '@mui/icons-material/Bolt';
import { Flex } from '@mantine/core';

const availableIconsMap = {
    ManageHistory: ManageHistoryIcon,
    ImportContacts: ImportContactsIcon,
    Face5: Face5Icon,
    Bolt: BoltIcon,
};

export const NavbarLink = ({
    to,
    icon,
    label,
}: {
    to: string;
    icon: keyof typeof availableIconsMap;
    label: string;
}) => {
    const { pathname } = useLocation();
    const isActive = pathname === to;

    const Icon = availableIconsMap[icon];

    return (
        <Flex
            component={Link}
            to={to}
            gap='12'
            px='24px'
            py='11px'
            fw={isActive ? 'bold' : undefined}
            td='none'
            c='fontColor'
            align='center'
            pos='relative'
            className={
                isActive
                    ? 'alpha-background hover-alpha-background-strong'
                    : 'hover-alpha-background'
            }
        >
            <Icon htmlColor='var(--mantine-color-brand-text)' /> {label}
        </Flex>
    );
};
