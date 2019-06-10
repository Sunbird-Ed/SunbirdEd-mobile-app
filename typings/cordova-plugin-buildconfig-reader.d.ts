// @ts-ignore
declare var buildconfigreader: {
  getBuildConfigValue: (packageName: string, property: string, success:
    (callbackUrl: string) => void, error: (error: string) => void) => void;

  getBuildConfigValues: (packageName: string, success:
    (callbackUrl: string) => void, error: (error: string) => void) => void;

  rm: (directoryPath: string, direcoryToBeSkipped: string, success:
    (callbackUrl: boolean) => void, error: (error: boolean) => void) => void;
};
