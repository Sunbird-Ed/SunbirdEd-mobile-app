import { UtilityService } from './utility-service';

describe('UtilityService', () => {
    let utilityService: UtilityService;

    beforeAll(() => {
        window['buildconfigreader'] = {
            getBuildConfigValue: jest.fn(() => { }),
            openPlayStore: jest.fn(() => { }),
            getDeviceAPILevel: jest.fn(() => { }),
            checkAppAvailability: jest.fn(() => { }),
            getDownloadDirectoryPath: jest.fn(() => { }),
            exportApk: jest.fn(() => { }),
            getDeviceSpec: jest.fn(() => { }),
            getUtmInfo: jest.fn(() => { }),
            clearUtmInfo: jest.fn(() => { }),
            readFromAssets: jest.fn(() => { }),
            rm: jest.fn(() => { }),
            getApkSize: jest.fn(() => { }),
            getMetaData: jest.fn(() => { }),
        };
        utilityService = new UtilityService();
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    /*
    * unit test case for getBuildConfigValue
    */
    describe('getBuildConfigValue()', () => {

        it('should delegate to builconfigreader plugin', (done) => {
            // arrange
            (window['buildconfigreader']['getBuildConfigValue'] as jest.Mock).
                mockImplementation((namespace, key, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.getBuildConfigValue('SOME_KEY').then(() => {
                // assert
                expect(window['buildconfigreader']['getBuildConfigValue']).
                    toHaveBeenCalledWith('org.sunbird.app', 'SOME_KEY', expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if buildConfig string for corresponding key was not found', (done) => {
            // arrange
            (window['buildconfigreader']['getBuildConfigValue'] as jest.Mock).
                mockImplementation((namespace, key, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.getBuildConfigValue('').catch(() => {
                // assert
                expect(window['buildconfigreader']['getBuildConfigValue']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject buildConfig string for corresponding key', (done) => {
            // arrange
            (window['buildconfigreader']['getBuildConfigValue'] as jest.Mock).
                mockImplementation((namespace, key, successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.getBuildConfigValue('SOME_KEY').catch(() => {
                // assert
                expect(window['buildconfigreader']['getBuildConfigValue']).
                    toHaveBeenCalledWith('org.sunbird.app', 'SOME_KEY', expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    /*
    * unit test case for Open PlayStore
    */
    describe('openPlayStore()', () => {
        it('should delegate to openPlayStore plugin', (done) => {
            // arrange
            (window['buildconfigreader']['openPlayStore'] as jest.Mock).mockImplementation((someId, successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                });
            });

            // act
            utilityService.openPlayStore('SOME_ID').then(() => {
                // assert
                expect(window['buildconfigreader']['openPlayStore']).
                    toHaveBeenCalledWith('SOME_ID', expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if OpenPlayStore string for corresponding key was not found', (done) => {
            // arrange
            (window['buildconfigreader']['openPlayStore'] as jest.Mock).mockImplementation((someId, successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.openPlayStore('').catch(() => {
                // assert
                expect(window['buildconfigreader']['openPlayStore']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject buildConfig string for corresponding key', (done) => {
            // arrange
            (window['buildconfigreader']['openPlayStore'] as jest.Mock).mockImplementation((someId, successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.openPlayStore('SOME_ID').catch(() => {
                // assert
                expect(window['buildconfigreader']['openPlayStore']).
                    toHaveBeenCalledWith('SOME_ID', expect.any(Function), expect.any(Function));
                done();
            });
        });
    });


    /*
    * unit test case for getDeviceAPILevel Method
    */
    describe('getDeviceAPILevel()', () => {
        it('should delegate to getDeviceAPILevel Method', (done) => {
            // arrange
            (window['buildconfigreader']['getDeviceAPILevel'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                }, 0);
            });

            // act
            utilityService.getDeviceAPILevel().then(() => {
                // assert
                expect(window['buildconfigreader']['getDeviceAPILevel']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if getDeviceAPILevel string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['getDeviceAPILevel'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.getDeviceAPILevel().catch(() => {
                // assert
                expect(window['buildconfigreader']['getDeviceAPILevel']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject getDeviceAPILevel string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['getDeviceAPILevel'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.getDeviceAPILevel().catch(() => {
                // assert
                expect(window['buildconfigreader']['getDeviceAPILevel']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    /*
    * unit test case for checkAppAvailability Method
    */
    describe('checkAppAvailability()', () => {
        it('should delegate to checkAppAvailability Method', (done) => {
            // arrange
            (window['buildconfigreader']['checkAppAvailability'] as jest.Mock).
                mockImplementation((SOME_PACKAGENAME, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.checkAppAvailability('SOME_PACKAGENAME').then(() => {
                // assert
                expect(window['buildconfigreader']['checkAppAvailability']).
                    toHaveBeenCalledWith('SOME_PACKAGENAME', expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if checkAppAvailability string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['checkAppAvailability'] as jest.Mock).
                mockImplementation((SOME_PACKAGENAME, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.checkAppAvailability('SOME_PACKAGENAME').catch(() => {
                // assert
                expect(window['buildconfigreader']['checkAppAvailability']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject checkAppAvailability string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['checkAppAvailability'] as jest.Mock).
                mockImplementation((SOME_PACKAGENAME, successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.checkAppAvailability('SOME_PACKAGENAME').catch(() => {
                // assert
                expect(window['buildconfigreader']['checkAppAvailability']).
                    toHaveBeenCalledWith('SOME_PACKAGENAME', expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    /*
    * unit test case for getDownloadDirectoryPath Method
    */
    describe('getDownloadDirectoryPath()', () => {
        it('should delegate to getDownloadDirectoryPath Method', (done) => {
            // arrange
            (window['buildconfigreader']['getDownloadDirectoryPath'] as jest.Mock).
                mockImplementation((successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.getDownloadDirectoryPath().then(() => {
                // assert
                expect(window['buildconfigreader']['getDownloadDirectoryPath']).
                    toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if checkAgetDownloadDirectoryPathppAvailability string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['getDownloadDirectoryPath'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.getDownloadDirectoryPath().catch(() => {
                // assert
                expect(window['buildconfigreader']['getDownloadDirectoryPath']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject getDownloadDirectoryPath string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['getDownloadDirectoryPath'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.getDownloadDirectoryPath().catch(() => {
                // assert
                expect(window['buildconfigreader']['getDownloadDirectoryPath']).
                    toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    /*
    * unit test case for exportApk Method
    */
    describe('exportApk()', () => {
        it('should delegate to exportApk Method', (done) => {
            // arrange
            (window['buildconfigreader']['exportApk'] as jest.Mock).
                mockImplementation((SOME_PATH, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.exportApk('sample_destination').then(() => {
                // assert
                expect(window['buildconfigreader']['exportApk']).toHaveBeenCalledWith('sample_destination',
                 expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if exportApk string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['exportApk'] as jest.Mock).
                mockImplementation((SOME_PATH, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.exportApk('sample_destination').catch(() => {
                // assert
                expect(window['buildconfigreader']['exportApk']).
                    toReturnWith(undefined);
                done();
            });
        });

        it('should reject exportApk string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['exportApk'] as jest.Mock).
                mockImplementation((successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.exportApk('sample_destination').catch(() => {
                // assert
                expect(window['buildconfigreader']['exportApk']).toHaveBeenCalledWith('sample_destination',
                    expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    /*
    * unit test case for getDeviceSpec Method
    */
    describe('getDeviceSpec()', () => {
        it('should delegate to getDeviceSpec Method', (done) => {
            // arrange
            (window['buildconfigreader']['getDeviceSpec'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                });
            });

            // act
            utilityService.getDeviceSpec().then(() => {
                // assert
                expect(window['buildconfigreader']['getDeviceSpec']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if getDeviceSpec string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['getDeviceSpec'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.getDeviceSpec().catch(() => {
                // assert
                expect(window['buildconfigreader']['getDeviceSpec']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject getDeviceSpec string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['getDeviceSpec'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.getDeviceSpec().catch(() => {
                // assert
                expect(window['buildconfigreader']['getDeviceSpec']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    /*
    * unit test case for getUtmInfo Method
    */
    describe('getUtmInfo()', () => {
        it('should delegate to getUtmInfo Method', (done) => {
            // arrange
            (window['buildconfigreader']['getUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                });
            });

            // act
            utilityService.getUtmInfo().then(() => {
                // assert
                expect(window['buildconfigreader']['getUtmInfo']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if getUtmInfo string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['getUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.getUtmInfo().catch(() => {
                // assert
                expect(window['buildconfigreader']['getUtmInfo']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject getUtmInfo string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['getUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.getUtmInfo().catch(() => {
                // assert
                expect(window['buildconfigreader']['getUtmInfo']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    /*
    * unit test case for clearUtmInfo Method
    */
    describe('clearUtmInfo()', () => {
        it('should delegate to clearUtmInfo Method', (done) => {
            // arrange
            (window['buildconfigreader']['clearUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                });
            });

            // act
            utilityService.clearUtmInfo().then(() => {
                // assert
                expect(window['buildconfigreader']['clearUtmInfo']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if clearUtmInfo string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['clearUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.clearUtmInfo().catch(() => {
                // assert
                expect(window['buildconfigreader']['clearUtmInfo']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject clearUtmInfo string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['clearUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.clearUtmInfo().catch(() => {
                // assert
                expect(window['buildconfigreader']['clearUtmInfo']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });
    });


    /*
    * unit test case for readFileFromAssets Method
    */
    describe('readFileFromAssets()', () => {
        it('should delegate to readFileFromAssets Method', (done) => {
            // arrange
            (window['buildconfigreader']['readFromAssets'] as jest.Mock).
                mockImplementation((SOME_FILENAME, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.readFileFromAssets('SOME_FILENAME').then(() => {
                // assert
                expect(window['buildconfigreader']['readFromAssets']).
                    toHaveBeenCalledWith('SOME_FILENAME', expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if readFileFromAssets string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['readFromAssets'] as jest.Mock).
                mockImplementation((SOME_FILENAME, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.readFileFromAssets('SOME_FILENAME').catch(() => {
                // assert
                expect(window['buildconfigreader']['readFromAssets']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject readFileFromAssets string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['readFromAssets'] as jest.Mock).
                mockImplementation((SOME_FILENAME, successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.readFileFromAssets('SOME_FILENAME').catch(() => {
                // assert
                expect(window['buildconfigreader']['readFromAssets']).
                    toHaveBeenCalledWith('SOME_FILENAME', expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    /*
   * unit test case for rm Method
   */
    describe('rm()', () => {
        it('should delegate to rm Method', (done) => {
            // arrange
            (window['buildconfigreader']['rm'] as jest.Mock).
                mockImplementation((SOME_DIRPATH, SOME_DIRTOSKIP, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.rm('SOME_DIRPATH', 'SOME_DIRTOSKIP').then(() => {
                // assert
                expect(window['buildconfigreader']['rm']).
                    toHaveBeenCalledWith('SOME_DIRPATH', 'SOME_DIRTOSKIP', expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if rm string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['rm'] as jest.Mock).
                mockImplementation((SOME_DIRPATH, SOME_DIRTOSKIP, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.rm('SOME_DIRPATH', 'SOME_DIRTOSKIP').catch(() => {
                // assert
                expect(window['buildconfigreader']['rm']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject rm string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['rm'] as jest.Mock).
                mockImplementation((SOME_DIRPATH, SOME_DIRTOSKIP, successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.rm('SOME_DIRPATH', 'SOME_DIRTOSKIP').catch(() => {
                // assert
                expect(window['buildconfigreader']['rm']).
                    toHaveBeenCalledWith('SOME_DIRPATH', 'SOME_DIRTOSKIP', expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    describe('getApkSize()', () => {
        it('should delegate to getApkSize', (done) => {
            // arrange
            (window['buildconfigreader']['getApkSize'] as jest.Mock).
                mockImplementation((successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.getApkSize().then(() => {
                // assert
                expect(window['buildconfigreader']['getApkSize']).
                    toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if getApkSize string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['getApkSize'] as jest.Mock).
                mockImplementation((successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.getApkSize().catch(() => {
                // assert
                expect(window['buildconfigreader']['getApkSize']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject getApkSize string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['getApkSize'] as jest.Mock).
                mockImplementation((successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.getApkSize().catch(() => {
                // assert
                expect(window['buildconfigreader']['getApkSize']).
                    toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    describe('getMetaData()', () => {
        it('should delegate to getMetaData Method', (done) => {
            // arrange
            (window['buildconfigreader']['getMetaData'] as jest.Mock).
            mockImplementation((SOME_PATH, successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback({ecar: { size: 123}});
                });
            });
            // act
            utilityService.getMetaData('sample_destination').then(() => {
                // assert
                expect(window['buildconfigreader']['getMetaData']).toHaveBeenCalledWith([{identifier: 'ecar', path: 'sample_destination'}],
                    expect.any(Function), expect.any(Function));
                done();
            });
        });
        it('should reject if getMetaData string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['getMetaData'] as jest.Mock).
            mockImplementation((SOME_PATH, successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });
            // act
            utilityService.getMetaData('sample_destination').catch(() => {
                // assert
                expect(window['buildconfigreader']['getMetaData']).
                toReturnWith(undefined);
                done();
            });
        });
        it('should reject getMetaData string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['getMetaData'] as jest.Mock).
            mockImplementation((successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.getMetaData('sample_destination').catch(() => {
                // assert
                expect(window['buildconfigreader']['getMetaData']).toHaveBeenCalledWith([{identifier: 'ecar', path: 'sample_destination'}],
                    expect.any(Function), expect.any(Function));
                done();
            });
        });
    });
    describe('removeFile()', () => {
        it('should delegate to removeFile Method', (done) => {
            // arrange
            (window['buildconfigreader']['rm'] as jest.Mock).
            mockImplementation(([SOME_PATH], SOME_VALUE, successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                });
            });
            // act
            utilityService.removeFile('sample_destination').then(() => {
                // assert
                expect(window['buildconfigreader']['rm']).toHaveBeenCalledWith(['sample_destination'], false,
                    expect.any(Function), expect.any(Function));
                done();
            });
        });
        it('should reject if removeFile string for corresponding entryString was not found', (done) => {
            // arrange
            (window['buildconfigreader']['rm'] as jest.Mock).
            mockImplementation(([SOME_PATH], SOME_VALUE, successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });
            // act
            utilityService.removeFile('sample_destination').catch(() => {
                // assert
                expect(window['buildconfigreader']['rm']).
                toReturnWith(undefined);
                done();
            });
        });
        it('should reject removeFile string for corresponding EntryString', (done) => {
            // arrange
            (window['buildconfigreader']['rm'] as jest.Mock).
            mockImplementation(([SOME_PATH], SOME_VALUE, successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.removeFile('sample_destination').catch(() => {
                // assert
                expect(window['buildconfigreader']['rm']).toHaveBeenCalledWith(['sample_destination'], false,
                    expect.any(Function), expect.any(Function));
                done();
            });
        });
    });
});
