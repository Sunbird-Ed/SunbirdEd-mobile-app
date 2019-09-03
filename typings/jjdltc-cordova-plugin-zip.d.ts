declare var JJzip: {
  unzip(sourceZip: string, option, successCallback, errorCallback);

  zip(directoryPath: string, option, directoriesToBeSkipped: string[], filesToBeSkipped: string[], successCallback, errorCallback);
};
