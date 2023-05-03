import { UtilityService } from './utility-service';

describe('UtilityService', () => {
    let utilityService: UtilityService;
    window.console.error = jest.fn()

    beforeAll(() => {
        window['sbutility'] = {
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
            verifyCaptcha: jest.fn(() => { }),
            getAppAvailabilityStatus: jest.fn(() => { }),
            startActivityForResult: jest.fn(() => { }),
            openFileManager: jest.fn(() => { })
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
            (window['sbutility']['getBuildConfigValue'] as jest.Mock).
                mockImplementation((namespace, key, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.getBuildConfigValue('SOME_KEY').then(() => {
                // assert
                expect(window['sbutility']['getBuildConfigValue']).
                    toHaveBeenCalledWith('org.sunbird.app', 'SOME_KEY', expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if buildConfig string for corresponding key was not found', (done) => {
            // arrange
            (window['sbutility']['getBuildConfigValue'] as jest.Mock).
                mockImplementation((namespace, key, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.getBuildConfigValue('').catch(() => {
                // assert
                expect(window['sbutility']['getBuildConfigValue']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject buildConfig string for corresponding key', (done) => {
            // arrange
            (window['sbutility']['getBuildConfigValue'] as jest.Mock).
                mockImplementation((namespace, key, successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.getBuildConfigValue('SOME_KEY').catch(() => {
                // assert
                expect(window['sbutility']['getBuildConfigValue']).
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
            (window['sbutility']['openPlayStore'] as jest.Mock).mockImplementation((someId, successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                });
            });

            // act
            utilityService.openPlayStore('SOME_ID').then(() => {
                // assert
                expect(window['sbutility']['openPlayStore']).
                    toHaveBeenCalledWith('SOME_ID', expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if OpenPlayStore string for corresponding key was not found', (done) => {
            // arrange
            (window['sbutility']['openPlayStore'] as jest.Mock).mockImplementation((someId, successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.openPlayStore('').catch(() => {
                // assert
                expect(window['sbutility']['openPlayStore']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject buildConfig string for corresponding key', (done) => {
            // arrange
            (window['sbutility']['openPlayStore'] as jest.Mock).mockImplementation((someId, successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.openPlayStore('SOME_ID').catch(() => {
                // assert
                expect(window['sbutility']['openPlayStore']).
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
            (window['sbutility']['getDeviceAPILevel'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                }, 0);
            });

            // act
            utilityService.getDeviceAPILevel().then(() => {
                // assert
                expect(window['sbutility']['getDeviceAPILevel']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if getDeviceAPILevel string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['getDeviceAPILevel'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.getDeviceAPILevel().catch(() => {
                // assert
                expect(window['sbutility']['getDeviceAPILevel']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject getDeviceAPILevel string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['getDeviceAPILevel'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.getDeviceAPILevel().catch(() => {
                // assert
                expect(window['sbutility']['getDeviceAPILevel']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
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
            (window['sbutility']['checkAppAvailability'] as jest.Mock).
                mockImplementation((SOME_PACKAGENAME, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.checkAppAvailability('SOME_PACKAGENAME').then(() => {
                // assert
                expect(window['sbutility']['checkAppAvailability']).
                    toHaveBeenCalledWith('SOME_PACKAGENAME', expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if checkAppAvailability string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['checkAppAvailability'] as jest.Mock).
                mockImplementation((SOME_PACKAGENAME, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.checkAppAvailability('SOME_PACKAGENAME').catch(() => {
                // assert
                expect(window['sbutility']['checkAppAvailability']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject checkAppAvailability string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['checkAppAvailability'] as jest.Mock).
                mockImplementation((SOME_PACKAGENAME, successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.checkAppAvailability('SOME_PACKAGENAME').catch(() => {
                // assert
                expect(window['sbutility']['checkAppAvailability']).
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
            (window['sbutility']['getDownloadDirectoryPath'] as jest.Mock).
                mockImplementation((successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.getDownloadDirectoryPath().then(() => {
                // assert
                expect(window['sbutility']['getDownloadDirectoryPath']).
                    toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if checkAgetDownloadDirectoryPathppAvailability string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['getDownloadDirectoryPath'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.getDownloadDirectoryPath().catch(() => {
                // assert
                expect(window['sbutility']['getDownloadDirectoryPath']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject getDownloadDirectoryPath string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['getDownloadDirectoryPath'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.getDownloadDirectoryPath().catch(() => {
                // assert
                expect(window['sbutility']['getDownloadDirectoryPath']).
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
            (window['sbutility']['exportApk'] as jest.Mock).
                mockImplementation((SOME_PATH, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.exportApk('sample_destination').then(() => {
                // assert
                expect(window['sbutility']['exportApk']).toHaveBeenCalledWith('sample_destination',
                    expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if exportApk string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['exportApk'] as jest.Mock).
                mockImplementation((SOME_PATH, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.exportApk('sample_destination').catch(() => {
                // assert
                expect(window['sbutility']['exportApk']).
                    toReturnWith(undefined);
                done();
            });
        });

        it('should reject exportApk string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['exportApk'] as jest.Mock).
                mockImplementation((successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.exportApk('sample_destination').catch(() => {
                // assert
                expect(window['sbutility']['exportApk']).toHaveBeenCalledWith('sample_destination',
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
            (window['sbutility']['getDeviceSpec'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                });
            });

            // act
            utilityService.getDeviceSpec().then(() => {
                // assert
                expect(window['sbutility']['getDeviceSpec']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if getDeviceSpec string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['getDeviceSpec'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.getDeviceSpec().catch(() => {
                // assert
                expect(window['sbutility']['getDeviceSpec']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject getDeviceSpec string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['getDeviceSpec'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.getDeviceSpec().catch(() => {
                // assert
                expect(window['sbutility']['getDeviceSpec']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
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
            (window['sbutility']['getUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                });
            });

            // act
            utilityService.getUtmInfo().then(() => {
                // assert
                expect(window['sbutility']['getUtmInfo']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if getUtmInfo string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['getUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.getUtmInfo().catch(() => {
                // assert
                expect(window['sbutility']['getUtmInfo']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject getUtmInfo string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['getUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.getUtmInfo().catch(() => {
                // assert
                expect(window['sbutility']['getUtmInfo']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
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
            (window['sbutility']['clearUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                });
            });

            // act
            utilityService.clearUtmInfo().then(() => {
                // assert
                expect(window['sbutility']['clearUtmInfo']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if clearUtmInfo string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['clearUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback();
                });
            });

            // act
            utilityService.clearUtmInfo().catch(() => {
                // assert
                expect(window['sbutility']['clearUtmInfo']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject clearUtmInfo string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['clearUtmInfo'] as jest.Mock).mockImplementation((successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.clearUtmInfo().catch(() => {
                // assert
                expect(window['sbutility']['clearUtmInfo']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
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
            (window['sbutility']['readFromAssets'] as jest.Mock).
                mockImplementation((SOME_FILENAME, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.readFileFromAssets('SOME_FILENAME').then(() => {
                // assert
                expect(window['sbutility']['readFromAssets']).
                    toHaveBeenCalledWith('SOME_FILENAME', expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if readFileFromAssets string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['readFromAssets'] as jest.Mock).
                mockImplementation((SOME_FILENAME, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.readFileFromAssets('SOME_FILENAME').catch(() => {
                // assert
                expect(window['sbutility']['readFromAssets']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject readFileFromAssets string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['readFromAssets'] as jest.Mock).
                mockImplementation((SOME_FILENAME, successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.readFileFromAssets('SOME_FILENAME').catch(() => {
                // assert
                expect(window['sbutility']['readFromAssets']).
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
            (window['sbutility']['rm'] as jest.Mock).
                mockImplementation((SOME_DIRPATH, SOME_DIRTOSKIP, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.rm('SOME_DIRPATH', 'SOME_DIRTOSKIP').then(() => {
                // assert
                expect(window['sbutility']['rm']).
                    toHaveBeenCalledWith('SOME_DIRPATH', 'SOME_DIRTOSKIP', expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if rm string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['rm'] as jest.Mock).
                mockImplementation((SOME_DIRPATH, SOME_DIRTOSKIP, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.rm('SOME_DIRPATH', 'SOME_DIRTOSKIP').catch(() => {
                // assert
                expect(window['sbutility']['rm']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject rm string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['rm'] as jest.Mock).
                mockImplementation((SOME_DIRPATH, SOME_DIRTOSKIP, successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.rm('SOME_DIRPATH', 'SOME_DIRTOSKIP').catch(() => {
                // assert
                expect(window['sbutility']['rm']).
                    toHaveBeenCalledWith('SOME_DIRPATH', 'SOME_DIRTOSKIP', expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    describe('getApkSize()', () => {
        it('should delegate to getApkSize', (done) => {
            // arrange
            (window['sbutility']['getApkSize'] as jest.Mock).
                mockImplementation((successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });

            // act
            utilityService.getApkSize().then(() => {
                // assert
                expect(window['sbutility']['getApkSize']).
                    toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if getApkSize string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['getApkSize'] as jest.Mock).
                mockImplementation((successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });

            // act
            utilityService.getApkSize().catch(() => {
                // assert
                expect(window['sbutility']['getApkSize']).toReturnWith(undefined);
                done();
            });
        });

        it('should reject getApkSize string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['getApkSize'] as jest.Mock).
                mockImplementation((successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.getApkSize().catch(() => {
                // assert
                expect(window['sbutility']['getApkSize']).
                    toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    describe('getMetaData()', () => {
        it('should delegate to getMetaData Method', (done) => {
            // arrange
            (window['sbutility']['getMetaData'] as jest.Mock).
                mockImplementation((SOME_PATH, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback({ ecar: { size: 123 } });
                    });
                });
            // act
            utilityService.getMetaData('sample_destination').then(() => {
                // assert
                expect(window['sbutility']['getMetaData']).toHaveBeenCalledWith([{ identifier: 'ecar', path: 'sample_destination' }],
                    expect.any(Function), expect.any(Function));
                done();
            });
        });
        it('should reject if getMetaData string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['getMetaData'] as jest.Mock).
                mockImplementation((SOME_PATH, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });
            // act
            utilityService.getMetaData('sample_destination').catch(() => {
                // assert
                expect(window['sbutility']['getMetaData']).
                    toReturnWith(undefined);
                done();
            });
        });
        it('should reject getMetaData string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['getMetaData'] as jest.Mock).
                mockImplementation((successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.getMetaData('sample_destination').catch(() => {
                // assert
                expect(window['sbutility']['getMetaData']).toHaveBeenCalledWith([{ identifier: 'ecar', path: 'sample_destination' }],
                    expect.any(Function), expect.any(Function));
                done();
            });
        });
    });
    describe('removeFile()', () => {
        it('should delegate to removeFile Method', (done) => {
            // arrange
            (window['sbutility']['rm'] as jest.Mock).
                mockImplementation(([SOME_PATH], SOME_VALUE, successCallback, errorCallback) => {
                    setTimeout(() => {
                        successCallback();
                    });
                });
            // act
            utilityService.removeFile('sample_destination').then(() => {
                // assert
                expect(window['sbutility']['rm']).toHaveBeenCalledWith(['sample_destination'], false,
                    expect.any(Function), expect.any(Function));
                done();
            });
        });
        it('should reject if removeFile string for corresponding entryString was not found', (done) => {
            // arrange
            (window['sbutility']['rm'] as jest.Mock).
                mockImplementation(([SOME_PATH], SOME_VALUE, successCallback, errorCallback) => {
                    setTimeout(() => {
                        errorCallback();
                    });
                });
            // act
            utilityService.removeFile('sample_destination').catch(() => {
                // assert
                expect(window['sbutility']['rm']).
                    toReturnWith(undefined);
                done();
            });
        });
        it('should reject removeFile string for corresponding EntryString', (done) => {
            // arrange
            (window['sbutility']['rm'] as jest.Mock).
                mockImplementation(([SOME_PATH], SOME_VALUE, successCallback, errorCallback) => {
                    throw Error;
                });
            // act
            utilityService.removeFile('sample_destination').catch(() => {
                // assert
                expect(window['sbutility']['rm']).toHaveBeenCalledWith(['sample_destination'], false,
                    expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    describe('getAppVersionCode()', () => {
        it('should delegate to getAppVersionCode Method with 1', () => {
            // arrange
            jest.spyOn(utilityService, 'getBuildConfigValue').mockResolvedValue(Promise.resolve('1'));
            // act
            // assert
            utilityService.getAppVersionCode().then((response) => {
                expect(response).toEqual(1);
            });
        });
        it('should reject to getAppVersionCode Method with 0', () => {
            // arrange
            jest.spyOn(utilityService, 'getBuildConfigValue').mockRejectedValue('0');
            // act
            // assert
            utilityService.getAppVersionCode().catch((err) => {
                expect(err).toEqual(0);
            });
        });
    });

    describe('verifyCaptcha()', () => {
        it('should delegate to verifyCaptcha Method', (done) => {
            // arrange
            (window['sbutility']['verifyCaptcha'] as jest.Mock).
            mockImplementation((SOME_KEY, successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                });
            });
            // act
            // assert
            utilityService.verifyCaptcha('key').then((response) => {
                expect(window['sbutility']['verifyCaptcha']).toHaveBeenCalledWith('key', expect.any(Function), expect.any(Function));
                done();
            });
        });
        it('should reject to verifyCaptcha Method', (done) => {
            // arrange
            (window['sbutility']['verifyCaptcha'] as jest.Mock).
            mockImplementation((SOME_PATH, successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback('error');
                });
            });
            // act
            // assert
            utilityService.verifyCaptcha('key').catch((err) => {
                expect(window['sbutility']['verifyCaptcha']).toHaveBeenCalledWith('key', expect.any(Function), expect.any(Function));
                done();
            });
        });
    });

    describe('checkAvailableAppList()', () => {
        it('should delegate to checkAvailableAppList Method', (done) => {
            // arrange
            (window['sbutility']['getAppAvailabilityStatus'] as jest.Mock).
            mockImplementation((SOME_PATH, successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback({});
                });
            });
            // act
            // assert
            utilityService.checkAvailableAppList(['key']).then((response) => {
                expect(response).toEqual({});
                expect(window['sbutility']['getAppAvailabilityStatus']).toHaveBeenCalledWith(['key'], expect.any(Function), expect.any(Function));
                done();
            });
        });
        it('should reject to checkAvailableAppList Method with 0', (done) => {
            // arrange
            (window['sbutility']['getAppAvailabilityStatus'] as jest.Mock).
            mockImplementation((SOME_VALUE, successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback('error');
                });
            });
            // act
            // assert
            utilityService.checkAvailableAppList(['key']).catch((err) => {
                expect(err).toEqual('error');
                expect(window['sbutility']['getAppAvailabilityStatus']).toHaveBeenCalledWith(['key'], expect.any(Function), expect.any(Function));
                done()
            });
        });
    });

    describe('startActivityForResult()', () => {
        it('should delegate to startActivityForResult Method with 1', (done) => {
            // arrange
            (window['sbutility']['startActivityForResult'] as jest.Mock).
            mockImplementation((SOME_VALUE, successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback({});
                });
            });
            // act
            // assert
            utilityService.startActivityForResult({'key':''}).then((response) => {
                expect(response).toEqual({});
                expect(window['sbutility']['startActivityForResult']).toHaveBeenCalledWith({'key':''}, expect.any(Function), expect.any(Function));
                done()
            });
        });
        it('should reject to startActivityForResult Method with 0', (done) => {
            // arrange
            (window['sbutility']['startActivityForResult'] as jest.Mock).
            mockImplementation((SOME_VALUE, successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback('err');
                });
            });
            // act
            // assert
            utilityService.startActivityForResult({'key':''}).catch((err) => {
                expect(err).toEqual('err');
                expect(window['sbutility']['startActivityForResult']).toHaveBeenCalledWith({'key':''}, expect.any(Function), expect.any(Function));
                done()
            });
        });
    });


    describe('openFileManager()', () => {
        it('should delegate to openFileManager Method with 1', (done) => {
            // arrange
            (window['sbutility']['openFileManager'] as jest.Mock).
            mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback({data:{}});
                });
            });
            // act
            // assert
            utilityService.openFileManager().then((response) => {
                expect(response).toEqual({data:{}});
                expect(window['sbutility']['openFileManager']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done()
            });
        });
        it('should reject to openFileManager Method with 0', (done) => {
            // arrange
            (window['sbutility']['openFileManager'] as jest.Mock).
            mockImplementation((successCallback, errorCallback) => {
                setTimeout(() => {
                    errorCallback('err');
                });
            });
            // act
            // assert
            utilityService.openFileManager().catch((err) => {
                expect(err).toEqual(err);
                expect(window['sbutility']['openFileManager']).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
                done()
            });
        });
    });

});
