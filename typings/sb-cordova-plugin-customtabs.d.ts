// @ts-ignore
declare var customtabs: {
  isAvailable: (success: () => void, error: (error: string) => void) => void;
  launch: (url: string, success: (callbackUrl: string) => void, error: (error: string) => void) => void;
  launchInBrowser: (url: string, success: (callbackUrl: string) => void, error: (error: string) => void) => void;
  close: (success: () => void, error: (error: string) => void) => void;
};
