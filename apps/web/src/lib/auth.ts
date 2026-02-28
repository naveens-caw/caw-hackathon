export type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

export const setTokenGetter = (nextGetter: TokenGetter | null): void => {
  tokenGetter = nextGetter;
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!tokenGetter) {
    return null;
  }

  return tokenGetter();
};
