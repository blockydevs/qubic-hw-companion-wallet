import type { PropsWithChildren } from 'react';

export const AddressCardButtonWrapper = ({
    children,
    to,
    isExternalLink,
}: PropsWithChildren<
    | {
          to: string;
          isExternalLink: boolean;
      }
    | {
          to?: never;
          isExternalLink?: false;
      }
>) => {
    if (isExternalLink) {
        return (
            <a href={to} target='_blank' rel='noopener noreferrer'>
                {children}
            </a>
        );
    }

    return children;
};
