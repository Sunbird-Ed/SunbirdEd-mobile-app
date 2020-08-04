// @ts-ignore
declare var sbutility: {
  getBuildConfigValue: (packageName: string, property: string, success:
    (callbackUrl: string) => void, error: (error: string) => void) => void;

  getBuildConfigValues: (packageName: string, success:
    (callbackUrl: string) => void, error: (error: string) => void) => void;

  rm: (directoryPath: string, direcoryToBeSkipped: string, success:
    (callbackUrl: boolean) => void, error: (error: boolean) => void) => void;

  getUtmInfo: (success:
    (callbackUrl: any) => void, error: (error: string) => void) => void;

  clearUtmInfo: (success:
    (callbackUrl: any) => void, error: (error: string) => void) => void;

  copyFile: (sourceDirectory: string, destinationDirectory: string, fileName: string,
    onSuccess: () => void, onError: (error: any) => void) => void;

  getMetaData: (fileMapList: any[], success:
    (callbackUrl: any) => void, error: (error: string) => void) => void;

  verifyCaptcha: (apiKey: string, success:
    (callbackUrl: any) => void, error: (error: string) => void) => void;

};
