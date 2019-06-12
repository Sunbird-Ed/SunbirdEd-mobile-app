interface SharedPreferences {
  getString: (key: string,
              defaultValue: any,
              successCallback: (response: string) => void,
              errorCallback: (response: string) => void) => void;
  putString: (key: string, value: string,
              successCallback: (response: string) => void,
              errorCallback: (response: string) => void) => void;
}

declare var plugins: {
  SharedPreferences: {
    getInstance: (name: string) => SharedPreferences
  }
};
