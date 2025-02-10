import { useMemo } from 'react';
import { SITE_NAME_WHITELIST } from '../constants';

export const useSiteHostName = () => {
    const siteHostname = useMemo(() => {
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:3000';
        } else if (SITE_NAME_WHITELIST.includes(window.location.hostname)) {
            return `https://${window.location.hostname}`;
        }

        return 'INVALID SITE';
    }, []);

    return { siteHostname };
};
