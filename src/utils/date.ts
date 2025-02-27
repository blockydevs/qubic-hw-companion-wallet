export const formatTimestamp = (timestamp: string) => {
    const ensuredUTCDate = new Date(Number(timestamp));

    if (isNaN(ensuredUTCDate.getTime())) {
        throw new Error('Invalid timestamp value');
    }

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
