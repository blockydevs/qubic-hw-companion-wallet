import { useEffect, useState } from 'react';
import { HOMEPAGE_SITE_NAME_WHITELIST } from '../../constants';

export const useHomepageSiteHostName = () => {
    const [siteHostname, setSiteHostname] = useState('INVALID SITE');

    useEffect(() => {
        if (window.location.hostname === 'localhost') {
            setSiteHostname('http://localhost:3000');
        } else {
            for (const currentWhitelist of HOMEPAGE_SITE_NAME_WHITELIST) {
                if (window.location.hostname === currentWhitelist) {
                    setSiteHostname(`https://${window.location.hostname}`);
                    break;
                }
            }
        }
    }, []);

    return { siteHostname };
};
