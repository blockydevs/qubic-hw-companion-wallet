export const setCache = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const getCache = <T>(key: string): T | undefined => {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : undefined;
};

export const removeCache = (key: string) => {
    localStorage.removeItem(key);
};
