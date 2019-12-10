declare var splashscreen: {
  show: () => void;
  hide: () => void;
  setImportProgress: (currentCount, totalCount) => void;
  getActions: (successCallback: (actions: string) => void) => void;
  markImportDone: () => void;
  clearPrefs: () => void;
};
