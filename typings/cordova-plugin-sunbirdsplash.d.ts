declare var splashscreen: {
  hide: () => void;
  setImportProgress: (currentCount, totalCount) => void;
  getActions: (successCallback: (actions: string) => void) => void;
  markImportDone: () => void;
};
