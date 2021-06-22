import {AboutUsComponent} from './about-us.component';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {
  ContentRequest, ContentService, DeviceInfo, GetAllProfileRequest, ProfileService, SharedPreferences
} from 'sunbird-sdk';
import {
  TelemetryGeneratorService,
  CommonUtilService,
  UtilityService,
  AppHeaderService,
  PageId,
  Environment,
  ImpressionType
} from '../../../services';
import { AudienceFilter, RouterLinks, GenericAppConfig, PrimaryCategory } from '../../app.constant';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Platform } from '@ionic/angular';
import { of } from 'rxjs/internal/observable/of';
import { serialize } from 'v8';

describe("AboutUsComponent", () => {
    let aboutUsComponent : AboutUsComponent;
    const mockProfileService : Partial<ProfileService> = {};
    const mockContentService : Partial<ContentService> = {};
    const mockDeviceInfo : Partial<DeviceInfo> = {};
    const mockSocialSharing : Partial<SocialSharing> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockUtilityService: Partial<UtilityService> = {};
    const mockAppHeaderService: Partial<AppHeaderService> = {};
    const mockRouter: Partial<Router> = {};
    const mockLocation: Partial<Location> = {};
    const mockAppVersion: Partial<AppVersion> = {};
    const mockPlatform: Partial<Platform> = {};

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
            mockPlatform as Platform
        );
    })
    
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create instance of AboutUsComponent',() => {
        expect(AboutUsComponent).toBeTruthy();
    });


    describe('goBack', () => {
        it('should call generateBackClickedTelemetry', () => {
            //arrange
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockLocation.back = jest.fn();
            //act
            aboutUsComponent.goBack();
            //assert
            // expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(PageId.SETTINGS_ABOUT_US, Environment.SETTINGS, false);
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalled()
            expect(mockLocation.back).toHaveBeenCalled();
        });

        
    })
    describe('generateInteractTelemetry()', () => {
        it('should generate a telemetry interact event', () => {
          // arrange
          const interactionType = 'some-interact-type';
          const interactSubtype = 'some-sub-type';
          mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
          // act 
          aboutUsComponent.generateInteractTelemetry(interactionType, interactSubtype);
          // assert
          expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
          expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            interactionType, interactSubtype, PageId.SETTINGS, Environment.SETTINGS, null
          );
        });
      });

      describe('generateImpressionEvent()', () => {
        it('should generate a telemetry impression event', () => {
          // arrange
          mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
          // act 
          aboutUsComponent.generateImpressionEvent();
          // assert
          expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalled();
          expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
            ImpressionType.VIEW, '',
            PageId.SETTINGS_ABOUT_US,
            Environment.SETTINGS, '', '', '',
            undefined,
            undefined
          );
        });
      });
      
      describe('getVersionCode()', () => {
        it('should get the verison code', (done) => {
            //arrange
            mockUtilityService.getBuildConfigValue = jest.fn(() =>
                Promise.resolve('sample-version-code')
            );
            const appName = 'appName';
            const versionName = 'versionName';
            //act
            aboutUsComponent.getVersionCode(appName, versionName);
            //assert
            setTimeout(() => {
                expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalledWith(
                    GenericAppConfig.VERSION_CODE
                );
                expect(aboutUsComponent.version).toEqual(
                    appName + ' v' + versionName + '.' + 'sample-version-code'
                );
                done();
            }, 0);
        });

        describe('getVersionName', () => {
            it('should...resolve', (done) => {
                //arrange
                mockUtilityService.getBuildConfigValue = jest.fn(() => 
                Promise.resolve('sample-response')
                );
                const appName = 'sample-app-name';
                jest.spyOn(aboutUsComponent, 'getVersionCode').mockImplementation();
                
                //act
                aboutUsComponent.getVersionName(appName);

                //assert
                setTimeout(() => {
                    expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalledWith(GenericAppConfig.VERSION_NAME);
                    done();
                },0)

            })

            it('should catch error', (done) => {
                //arrange
                mockUtilityService.getBuildConfigValue = jest.fn(() => 
                Promise.reject()
                );
                const appName = 'sample-app-name';
                jest.spyOn(aboutUsComponent, 'getVersionCode').mockImplementation();
                
                //act
                aboutUsComponent.getVersionName(appName);

                //assert
                setTimeout(() => {
                    expect(mockUtilityService.getBuildConfigValue).toHaveBeenCalledWith(GenericAppConfig.VERSION_NAME);
                    done();
                },0)

            })
        })

        describe('handleBack()', () => {
            it('should genrate telemetry event and navigates back', () => {
                //assert
                mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
                mockLocation.back = jest.fn();

                const subscribeWithPriorityData = jest.fn((_, fn) => fn());
                mockPlatform.backButton = {
                    subscribeWithPriority: subscribeWithPriorityData,
                } as any;
                aboutUsComponent.backButtonFunc = {
                    unsubscribe: jest.fn()
                } as any
                //act
                aboutUsComponent.handleBackButton();
                //assert
                expect(
                    mockTelemetryGeneratorService.generateBackClickedTelemetry
                ).toHaveBeenCalledWith(
                    PageId.SETTINGS_ABOUT_US,
                    Environment.SETTINGS,
                    false
                );
            });
        });

        describe('shareInformation', () => {
            it('should share file if..', () => {
                //assert
                const allUserProfileRequest: GetAllProfileRequest = {
                    local: true,
                    server: true,
                };
                const contentRequest: ContentRequest = {
                    primaryCategories: PrimaryCategory.FOR_DOWNLOADED_TAB,
                    audience: AudienceFilter.GUEST_TEACHER,
                };
                aboutUsComponent.generateInteractTelemetry = jest.fn();
                //act
                //assert
            });

            it('should reject data sharing', () => { });
        });
    });

    describe('shareInformation', () => {
        it('should share content or profile', (done) => {
            // arrange
            jest.spyOn(aboutUsComponent, 'generateInteractTelemetry').mockImplementation(() => {
                return;
            });
            mockProfileService.getAllProfiles = jest.fn(() => of([{
                uid: 'sample-uid',
                handle: 'sample-name'
            }]));
            mockContentService.getContents = jest.fn(() => of([{
                contentId: 'sample-content-id',
                identifier: 'do_123'
            }]));
            const KEY_SUNBIRD_CONFIG_FILE_PATH = 'sunbird_config_file_path';
            mockCommonUtilService.getLoader = jest.fn(() => Promise.resolve({
                present: jest.fn(),
                dismiss: jest.fn()
            }));
            (window as any).supportfile = {
                shareSunbirdConfigurations: jest.fn((a, b, c) => c({}))
            };
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            mockSharedPreferences.getString = jest.fn(() => of('http://sample-path'));
            mockSocialSharing.share = jest.fn(() => Promise.resolve({}));
            // act
            aboutUsComponent.shareInformation();
            // assert
            setTimeout(() => {
                expect(mockProfileService.getAllProfiles).toHaveBeenCalled();
                expect(mockContentService.getContents).toHaveBeenCalled();
                expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
                expect(mockSharedPreferences.putString).toHaveBeenCalled();
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(KEY_SUNBIRD_CONFIG_FILE_PATH);
                expect(mockSocialSharing.share).toHaveBeenCalled();
                done();
            }, 0);
        });

        
    });

    describe('ngOnit', () => {
      it('should....', (done) => {
        //arrange
        mockDeviceInfo.getDeviceID = jest.fn(() => ('sample-id'));
        mockAppVersion.getAppName = jest.fn(() =>
        Promise.resolve('sample-app-name')
        );
        jest.spyOn(aboutUsComponent, 'getVersionName').mockImplementation(() => {
            return 'sample-val';
        });

        //act
        aboutUsComponent.ngOnInit()

        //assert
        setTimeout(() =>{
            expect(mockAppVersion.getAppName).toHaveBeenCalled();
            expect(aboutUsComponent.deviceId).toEqual('sample-id');
            done();
        },0);
      })
    });

    describe('ionViewWillLeave', () => {
        it('should..', () => {
            //arrange
            aboutUsComponent.backButtonFunc = {
                unsubscribe: jest.fn()
            } as any

            //act
            aboutUsComponent.ionViewWillLeave();

            //assert
            expect(aboutUsComponent['backButtonFunc'].unsubscribe).toHaveBeenCalled();
        });
    });

    

    describe('ionViewWillEnter', () => {
        it('should ', () => {
            //arrange
            mockAppHeaderService.getDefaultPageConfig = jest.fn(() => ({
                showHeader: false,
                showBurgerMenu: false,
                showKebabMenu: true,
                kebabMenuOptions: [],
                pageTitle: 'sample-page-title',
                actionButtons: []
            }));
            mockAppHeaderService.updatePageConfig = jest.fn();
            jest.spyOn(aboutUsComponent, 'handleBackButton').mockImplementation();

            //act
            aboutUsComponent.ionViewWillEnter();

            //assert
            expect(mockAppHeaderService.getDefaultPageConfig).toHaveBeenCalled();
            expect(mockAppHeaderService.updatePageConfig).toHaveBeenCalledWith(
                {
                    showHeader: false,
                    showBurgerMenu: false,
                    showKebabMenu: true,
                    kebabMenuOptions: [],
                    pageTitle: 'sample-page-title',
                    actionButtons: []
                }
            );
            expect(aboutUsComponent.handleBackButton).toHaveBeenCalled();
        })
    });

    describe('openTermsOfUse', () => {
        it('should show terms of use', (done) => {
            //arrange
            jest.spyOn(aboutUsComponent,'generateInteractTelemetry').mockImplementation();
            mockUtilityService.getBuildConfigValue = jest.fn((baseUrl) => 
            Promise.resolve('sample-entry')
            );
            (window as any).cordova = {
                InAppBrowser: {
                    open: jest.fn(() => of({}))
                }
            };
            const options
              = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';
            const url = 'sample-entry' + RouterLinks.TERM_OF_USE;


            //act
            aboutUsComponent.openTermsOfUse()

            //assert
            setTimeout(() => {
                expect((window as any).cordova.InAppBrowser.open).toHaveBeenCalledWith(
                    url, '_blank', options
                );
                done();
            },0);
        })
    })


});















