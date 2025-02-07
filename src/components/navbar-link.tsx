import React from 'react';
import { Link, useLocation } from 'react-router';
import * as Icons from '@mui/icons-material';
import { Flex } from '@mantine/core';

export const NavbarLink = ({ to, icon, label }: { to: string; icon: string; label: string }) => {
    const Icon = Icons[icon];
    const { pathname } = useLocation();
    const isActive = pathname === to;

    return (
        <Flex
            component={Link}
            to={to}
            gap='12'
            px='24px'
            py='11.62px'
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
