import type { ILocaleSeparators } from '@/types';

export const IS_DEMO_MODE = process.env.REACT_APP_IS_DEMO_MODE === 'true';

export const NAVBAR_WIDTH = 249;

export const NAVBAR_TRANSITION_DURATION = 200;

export const NAVBAR_TRANSITION_TIMING_FUNCTION = 'ease';

export const HEADER_HEIGHT = 64;

export const MAX_APP_WIDTH = 1920;

export const TRANSACTIONS_PAGE_SIZE = 10;

export const DEFAULT_LOCALE = 'en-US';

export const DEFAULT_LOCALE_SEPARATORS: ILocaleSeparators = {
    decimalSeparator: '.',
    groupSeparator: ',',
};
