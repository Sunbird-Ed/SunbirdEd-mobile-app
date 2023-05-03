import {NavParams, PopoverController} from '@ionic/angular';
import {ShowVendorAppsComponent} from './show-vendor-apps.component';
import {
    TelemetryGeneratorService,
    UtilityService,
    CommonUtilService,
} from '../../../services';

describe('ShowVendorAppsComponent', () => {
    let showVendorAppsComponent: ShowVendorAppsComponent;
    const mockNavParams: Partial<NavParams> = {
        get: jest.fn((arg) => {
            let value;
            switch (arg) {
                case 'content':
                    value = {
                        artifactUrl: 'https://sample',
                    };
                    break;
                case 'appLists':
                    value = [
                        {
                            name: 'Google Bolo',
                            logo:
                                'https://img.icons8.com/doodle/48/000000/league-of-legends.png',
                            provider: {
                                name: 'Google',
                                copyright: '',
                                license: '',
                            },
                            android: {
                                packageId: 'io.ionic.sender',
                                appVersion: '54',
                                compatibilityVer: '',
                            },
                            ios: {
                                packageId: '',
                                appVersion: '',
                                urlScheme: '',
                                compatibilityVer: '',
                            },
                            target: {
                                mimeType: ['application/pdf'],
                                primaryCategory: ['LearningResource'],
                            },
                        },
                    ];
                    break;
            }
        }),
    };
    const mockUtilityService: Partial<UtilityService> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockPopoverCtrl: Partial<PopoverController> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};

    beforeAll(() => {
        showVendorAppsComponent = new ShowVendorAppsComponent(
            mockNavParams as NavParams,
            mockUtilityService as UtilityService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockPopoverCtrl as PopoverController,
            mockCommonUtilService as CommonUtilService
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should provide instance of showVendorAppsComponent', () => {
        expect(showVendorAppsComponent).toBeTruthy();
    });

    it('should fetch appName and list of app Available in devices', (done) => {
        // arrange
        showVendorAppsComponent.appLists = [
            {
                name: 'Google Bolo',
                logo: 'https://img.icons8.com/doodle/48/000000/league-of-legends.png',
                provider: {
                    name: 'Google',
                    copyright: '',
                    license: ''
                },
                android: {
                    packageId: 'io.ionic.sender',
                    appVersion: '54',
                    compatibilityVer: ''
                },
                ios: {
                    packageId: '',
                    appVersion: '',
                    urlScheme: '',
                    compatibilityVer: ''
                },
                target: {
                    mimeType: [
                        'application/pdf'
                    ],
                    primaryCategory: [
                        'LearningResource'
                    ]
                }
            },

        ];
        mockCommonUtilService.getAppName = jest.fn(() =>
            Promise.resolve('Sunbird')
        );
        mockUtilityService.checkAvailableAppList = jest.fn(() =>
            Promise.resolve({
                'io.ionic.sender': false,
                'io.ionic.receiver': true,
                'io.ionic.receiver5': false,
            })
        );
        // act
        showVendorAppsComponent.ngOnInit();
        // assert
        expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
        setTimeout(() => {
            expect(mockUtilityService.checkAvailableAppList).toHaveBeenCalled();
            done();
        }, 0);
    });

    describe('openThirdPartyApps', () => {

        it('should open playStore with packageId', (done) => {
            // arrange
            mockUtilityService.openPlayStore = jest.fn(() => Promise.resolve('SUCCESS'));
            // act
            showVendorAppsComponent.openThirdPartyApps('io.ionic.sender', false);
            // assert
            setTimeout(() => {
                expect(mockUtilityService.openPlayStore).toHaveBeenCalledWith('io.ionic.sender');
                done();
            }, 0);
        });

        it('should get packageId and check of appAvailability if true then call utility Service', (done) => {
            // arrange
            mockUtilityService.startActivityForResult = jest.fn(() =>
                Promise.resolve({
                    extras: {
                        resultCode: -1,
                        edata: {
                            starttime: 1000,
                            endtime: 3000,
                            type: 'session',
                            timespent: 500,
                            pageviews: 3,
                            interactions: 3
                        },
                        requestCode: 101
                    },
                    flags: 0
                })
            );
            mockTelemetryGeneratorService.generateSummaryTelemetry = jest.fn();
            mockPopoverCtrl.dismiss = jest.fn();
            // act
            showVendorAppsComponent.openThirdPartyApps('io.ionic.receiver', true);
            // assert
            setTimeout(() => {
                expect(mockUtilityService.startActivityForResult).toHaveBeenCalledWith(
                    {
                        package: 'io.ionic.receiver',
                        extras: {
                            content: showVendorAppsComponent.content
                        },
                        requestCode: 101
                    }
                );
                expect(mockTelemetryGeneratorService.generateSummaryTelemetry).toHaveBeenCalledWith(
                    'session',
                    1000, 3000, 500, 3, 3, 'home'
                );
                expect(mockPopoverCtrl.dismiss).toHaveBeenCalled();
                done();
            }, 0);
        });
    });
});
