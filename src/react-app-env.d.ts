/// <reference types="react-scripts" />

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
