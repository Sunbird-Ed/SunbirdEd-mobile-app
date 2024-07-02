import {AboutUsComponent} from '../../../app/settings/about-us/about-us.component';
import {SocialSharing} from '@awesome-cordova-plugins/social-sharing/ngx';
import {
    CommonUtilService,
    Environment,
    ImpressionType, InteractSubtype, InteractType,
    PageId,
    TelemetryGeneratorService
} from '../../../services';
import {Location} from '@angular/common';
import {Platform} from '@ionic/angular';
import {Router} from '@angular/router';
import {AppVersion} from '@awesome-cordova-plugins/app-version/ngx';
import {AppHeaderService, UtilityService} from '../../../services';
import {ContentService, DeviceInfo, ProfileService, SharedPreferences} from '@project-sunbird/sunbird-sdk';
import {of, Subscription} from 'rxjs';

window['sbutility'] = {
    removeFile: jest.fn(),
    shareSunbirdConfigurations: jest.fn((_, __, fn) => fn())
};
window.console.error = jest.fn()

describe('AboutUsComponent', () => {
    let aboutUsComponent: AboutUsComponent;

    const mockProfileService: Partial<ProfileService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockSocialSharing: Partial<SocialSharing> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockAppHeaderService: Partial<AppHeaderService> = {};
    const mockRouter: Partial<Router> = {};
    const mockLocation: Partial<Location> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockPlatform: Partial<Platform> = {
        backButton: {
            subscribeWithPriority: jest.fn((_, fn) => {
                fn();
                return {
                    unsubscribe: jest.fn()
                };
            }),
        }
    } as any;

    beforeAll(() => {
        aboutUsComponent = new AboutUsComponent(
            mockProfileService as ProfileService,
            mockContentService as ContentService,
            mockDeviceInfo as DeviceInfo,
            mockSocialSharing as SocialSharing,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockCommonUtilService as CommonUtilService,
            mockSharedPreferences as SharedPreferences,
            mockUtilityService as UtilityService,
            mockAppHeaderService as AppHeaderService,
            mockRouter as Router,
            mockLocation as Location,
            mockAppVersion as AppVersion,
            mockPlatform as Platform,
        );
    });

    it('should be able to create an instance', () => {
        expect(aboutUsComponent).toBeTruthy();
    });

    describe('generateImpressionEvent()', () => {

        it('should generate telemetry', () => {
            // arrange
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            // act
            aboutUsComponent.generateImpressionEvent();
            // assert
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW, '',
                PageId.SETTINGS_ABOUT_US,
                Environment.SETTINGS, '', '', ''
            );
        });
    });

    describe('goBack()', () => {

        it('should generate telemetry', () => {
            // arrange
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            // act
            aboutUsComponent.goBack();
            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.SETTINGS_ABOUT_US, Environment.SETTINGS, true
            );

        });
    });

    it('ionViewWillEnter will get the default config and register backButton', () => {
        // arrange
        const mockConfig = {
            showHeader: true,
            showBurgerMenu: true,
            actionButtons: [],
        };
        mockAppHeaderService.headerConfigEmitted$ = of(mockConfig);
        mockAppHeaderService.getDefaultPageConfig = jest.fn(() => {
            return mockConfig;
        });
        mockAppHeaderService.updatePageConfig = jest.fn();
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData
        } as any;
        const unsubscribeFn = jest.fn();
        aboutUsComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn
        };
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        aboutUsComponent.ionViewWillEnter();
        // assert
        expect(mockAppHeaderService.getDefaultPageConfig).toHaveBeenCalled();
        expect(mockAppHeaderService.updatePageConfig).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalled();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should fetch deviceId, getAppName and versionName', () => {
        // arrange
        mockDeviceInfo.getDeviceID = jest.fn(() => 'sample_device_id');
        mockAppVersion.getAppName = jest.fn(() => Promise.resolve('sample_appName'));
        mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('sample_build_value'));
        // act
        aboutUsComponent.ngOnInit();
        // assert
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
        expect(mockAppVersion.getAppName).toHaveBeenCalled();
    });

    it('should generate Interact telemetry ', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        aboutUsComponent.generateInteractTelemetry(InteractType.TOUCH, InteractSubtype.SHARE_APP_CLICKED);
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
    });

    describe('ionViewWillLeave()', () => {
        it('should unsubscribe to the backbutton events', () => {
            // arrange
            const mockbackButtonFuncSubscription = { unsubscribe: jest.fn() } as Partial<Subscription>;
            aboutUsComponent['backButtonFunc'] = mockbackButtonFuncSubscription as any;
            // act
            aboutUsComponent.ionViewWillLeave();
            // assert
            expect(aboutUsComponent['backButtonFunc'].unsubscribe).toHaveBeenCalled();
        });

        it('should return if no backbutton events', () => {
            // arrange
            aboutUsComponent['backButtonFunc'] = false;
            // act
            aboutUsComponent.ionViewWillLeave();
            // assert
        });
    
    });

    describe('ionViewDidLeave', () => {
        it('should remove sub utility file ', (done) => {
            // arrange
            window['sbutility'].removeFile = jest.fn((fn) => fn())
            // act
            aboutUsComponent.ionViewDidLeave();
            // asert
            setTimeout(() => {
                expect(window['sbutility'].removeFile).toBeCalled();
                expect(aboutUsComponent.loading).toBeUndefined();
                done();
            }, 10);
        })
        it('should catch error on remove sub utility file ', (done) => {
            // arrange
            window['sbutility'].removeFile = jest.fn((success, error) => {
                error({})
            })
            // act
            aboutUsComponent.ionViewDidLeave();
            // asert
            setTimeout(() => {
                expect(window['sbutility'].removeFile).toHaveBeenCalled();
                expect(aboutUsComponent.loading).toBeUndefined();
                done();
            }, 10);
        })
    })

    describe('shareInformation', () => {
        it('should share information', (done) => {
            // arrange
            const present = jest.fn(() => Promise.resolve());
            const dismiss = jest.fn(() => Promise.resolve());
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            mockProfileService.getAllProfiles = jest.fn(()=> of([]))
            mockContentService.getContents = jest.fn(() => of([]))
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve(
                {present,
                dismiss}
            ));
            mockSharedPreferences.putString = jest.fn(() => of())
            mockSharedPreferences.getString = jest.fn(() => of('true'))
            mockSocialSharing.share = jest.fn(() => Promise.resolve())
            // act 
            aboutUsComponent.shareInformation()
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalled();
                expect(mockContentService.getContents).toHaveBeenCalled()
                expect(window['sbutility'].shareSunbirdConfigurations).toHaveBeenCalled()
                done()
            }, 0);
        })

        it('should return without sharing information, if config file path is false', (done) => {
            // arrange
            const present = jest.fn(() => Promise.resolve());
            const dismiss = jest.fn(() => Promise.resolve());
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            mockProfileService.getAllProfiles = jest.fn(()=> of([]))
            mockContentService.getContents = jest.fn(() => of([]))
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve(
                {present,
                dismiss}
            ));
            mockSharedPreferences.putString = jest.fn(() => of())
            mockSharedPreferences.getString = jest.fn(() => of(false)) as any
            // act 
            aboutUsComponent.shareInformation()
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalled();
                expect(mockContentService.getContents).toHaveBeenCalled()
                expect(window['sbutility'].shareSunbirdConfigurations).toHaveBeenCalled();
                done()
            }, 0);
        })

        it('should return without sharing information, if config file path is false', (done) => {
            // arrange
            const present = jest.fn(() => Promise.resolve());
            const dismiss = jest.fn(() => Promise.resolve());
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            mockProfileService.getAllProfiles = jest.fn(()=> of([]))
            mockContentService.getContents = jest.fn(() => of([]))
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve(
                {present,
                dismiss}
            ));
            window['sbutility'].shareSunbirdConfigurations = jest.fn((_, _1, success, error) => {
                error({})
            })
            // act 
            aboutUsComponent.shareInformation()
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalled();
                expect(mockContentService.getContents).toHaveBeenCalled()
                expect(window['sbutility'].shareSunbirdConfigurations).toThrowError();
                done()
            }, 0);
        })

        it('should return without sharing information, if config file path is false, if no loader', (done) => {
            // arrange
            const present = jest.fn(() => Promise.resolve());
            const dismiss = jest.fn(() => Promise.resolve());
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            mockProfileService.getAllProfiles = jest.fn(()=> of([]))
            mockContentService.getContents = jest.fn(() => of([]))
            mockCommonUtilService.getLoader = jest.fn(() => undefined);
            window['sbutility'].shareSunbirdConfigurations = jest.fn((_, _1, success, error) => {
                error({})
            })
            // act 
            aboutUsComponent.shareInformation()
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalled();
                expect(mockContentService.getContents).toHaveBeenCalled()
                expect(window['sbutility'].shareSunbirdConfigurations).toThrowError();
                done()
            }, 0);
        })

        it('should catch error on share information', (done) => {
            // arrange
            const present = jest.fn(() => Promise.resolve());
            const dismiss = jest.fn(() => Promise.resolve());
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            mockProfileService.getAllProfiles = jest.fn(()=> of([]))
            mockContentService.getContents = jest.fn(() => of([]))
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve(
                {present,
                dismiss}
            ));
            mockSharedPreferences.putString = jest.fn(() => of())
            mockSharedPreferences.getString = jest.fn(() => of('true'))
            mockSocialSharing.share = jest.fn(() => Promise.reject())
            window['sbutility'].shareSunbirdConfigurations = jest.fn((_, _1, success, error) => {
                success({})
            })
            // act 
            aboutUsComponent.shareInformation()
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalled();
                expect(mockContentService.getContents).toHaveBeenCalled()
                expect(window['sbutility'].shareSunbirdConfigurations).toHaveBeenCalled();
                done()
            }, 0);
        })
    })
    describe('handleBackButton()', () => {
        it('should ', () => {
            // arrange
            aboutUsComponent.ShouldGenerateBackClickedTelemetry = true;
            mockPlatform.backButton = {
                subscribeWithPriority: jest.fn((x, callback) => callback()),
                is: jest.fn()
            };
            mockLocation.back = jest.fn();
            const unsubscribeFn = jest.fn();
            aboutUsComponent.backButtonFunc = {
            unsubscribe: unsubscribeFn,
            } as any;
            // act
            aboutUsComponent.handleBackButton();
            // assert
            expect(mockLocation.back).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.SETTINGS_ABOUT_US, Environment.SETTINGS, false);

        });
    });

    describe('openTermsOfUse', () => {
        it('should open terms of use ', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
            mockUtilityService.getBuildConfigValue = jest.fn();
            window.cordova['InAppBrowser'].open = jest.fn()
            // act
            aboutUsComponent.openTermsOfUse()
            // assert
            setTimeout(() => {
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalled()
                done()
            }, 0);
        })
    })
});
