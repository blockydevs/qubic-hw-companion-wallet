export const formatTimestamp = (date: string) => {
    const ensuredUTCDate = new Date(date.replace(' ', 'T') + 'Z'); // Ensure UTC interpretation

    const formattedDate = new Intl.DateTimeFormat(navigator.language, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    }).format(ensuredUTCDate);

    return formattedDate;
};
