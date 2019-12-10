declare var codePush: {
    sync: (a,b,c) => void;
    getCurrentPackage: (a) => void
  };
declare var SyncStatus: {
  DOWNLOADING_PACKAGE,
  INSTALLING_UPDATE,
  ERROR
}