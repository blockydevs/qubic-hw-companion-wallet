import { SITE_NAME_WHITELIST } from '../constants';

export const getSiteHostName = () => {
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:3000';
    } else if (SITE_NAME_WHITELIST.includes(window.location.hostname)) {
        return `https://${window.location.hostname}`;
    }

    return 'INVALID SITE';
};
