import { UtilityService } from './utility-service';

describe('UtilityService', () => {
    let utilityService: UtilityService;

    beforeAll(() => {
        window['buildconfigreader'] = { getBuildConfigValue: jest.fn(() => {}) };
        utilityService = new UtilityService();
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('getBuildConfigValue()', () => {
        it('should delegate to builconfigreader plugin', (done) => {
            // arrange
            (window['buildconfigreader']['getBuildConfigValue'] as jest.Mock).mockImplementation((namespace, key, successCallback, errorCallback) => {
                setTimeout(() => {
                    successCallback();
                });
            });

            // act
            utilityService.getBuildConfigValue('SOME_KEY').then(() => {
                // assert
                expect(window['buildconfigreader']['getBuildConfigValue']).toHaveBeenCalledWith('org.sunbird.app', 'SOME_KEY', expect.any(Function), expect.any(Function));
                done();
            });
        });

        it('should reject if buildConfig string for corresponding key was not found', (done) => {
            // arrange
            (window['buildconfigreader']['getBuildConfigValue'] as jest.Mock).mockImplementation((namespace, key, successCallback, errorCallback) => {
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
            (window['buildconfigreader']['getBuildConfigValue'] as jest.Mock).mockImplementation((namespace, key, successCallback, errorCallback) => {
                throw Error;
            });
            // act
            utilityService.getBuildConfigValue("SOME_KEY").catch(() => {
                // assert
                expect(window['buildconfigreader']['getBuildConfigValue']).toHaveBeenCalledWith('org.sunbird.app', 'SOME_KEY', expect.any(Function), expect.any(Function));
                done();
            });
        });
    });
});