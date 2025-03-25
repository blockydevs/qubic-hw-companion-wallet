export const getUserLocale = () => {
    if (typeof navigator !== 'undefined') {
        return navigator.language;
    }

    return Intl.DateTimeFormat().resolvedOptions().locale;
};

export const getLocaleSeparators = (locale: string) => {
    const numberFormat = new Intl.NumberFormat(locale);
    const parts = numberFormat.formatToParts(12345.67);

    const decimalSeparator = parts.find((part) => part.type === 'decimal').value;
    const groupSeparator = parts.find((part) => part.type === 'group').value;

    return { decimalSeparator, groupSeparator };
};
