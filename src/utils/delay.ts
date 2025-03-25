export const delay = (ms: number = 0) =>
    new Promise((resolve: (args: void) => void) => {
        setTimeout(resolve, ms);
    });
