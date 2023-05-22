import { LanguageSettingsPage } from './language-settings';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { Events } from '../../util/events';
import { NgZone } from '@angular/core';
import {
    AppHeaderService,
    CommonUtilService,
    Environment, ID, ImpressionType, InteractSubtype,
    InteractType,
    NotificationService, PageId,
    TelemetryGeneratorService
} from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NativePageTransitions } from '@awesome-cordova-plugins/native-page-transitions/ngx';
import { appLanguages, PreferenceKey, RouterLinks } from '../../app/app.constant';
import { of } from 'rxjs';
import { CorReleationDataType, OnboardingConfigurationService } from '../../services';
import { CorrelationData } from '../../../../sunbird-mobile-sdk/src';
import { mockOnboardingConfigData } from '../components/discover/discover.page.spec.data';


describe('LanguageSettingsPage', () => {
    let languageSettingsPage: LanguageSettingsPage;

    global.window.segmentation = {
        init: jest.fn(),
        SBTagService: {
            pushTag: jest.fn(),
            removeAllTags: jest.fn(),
            restoreTags: jest.fn()
        }
    };

    const mockPreferences: Partial<SharedPreferences> = {
        putBoolean: jest.fn(() => of(undefined))
    };

    const mockTranslateService: Partial<TranslateService> = {};

    const mockEvents: Partial<Events> = {};

    const mockNgZone: Partial<NgZone> = {};

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateAuditTelemetry: jest.fn(),
        generatePageLoadedTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    const mockPlatform: Partial<Platform> = {
        is: jest.fn(platform => platform === 'android')
    };

    const mockCommonUtilService: Partial<CommonUtilService> = {};

    const mockAppHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn(),
        showHeaderWithBackButton: jest.fn(),
        showStatusBar: jest.fn(),
        showHeaderWithHomeButton: jest.fn()
    };

    const mockNotificationService: Partial<NotificationService> = {};

    let mockRouter: Partial<Router> = {
        url: '/' + RouterLinks.LANGUAGE_SETTING + '/' + 'true'
    };

    const mockLocation: Partial<Location> = {};

    const mockActivatedRoute: Partial<ActivatedRoute> = {
    };

    const mockNativeTransitions: Partial<NativePageTransitions> = {};

    const mockOnBoardingConfigService: Partial<OnboardingConfigurationService> = {
        getOnboardingConfig: jest.fn(() => mockOnboardingConfigData.onboarding[0] as any)
    };

    beforeAll(() => {
        languageSettingsPage = new LanguageSettingsPage(
            mockPreferences as SharedPreferences,
            mockTranslateService as TranslateService,
            mockEvents as Events,
            mockNgZone as NgZone,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockAppHeaderService as AppHeaderService,
            mockNotificationService as NotificationService,
            mockRouter as Router,
            mockLocation as Location,
            mockActivatedRoute as ActivatedRoute,
            mockNativeTransitions as NativePageTransitions,
            mockOnBoardingConfigService as OnboardingConfigurationService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create instance of language-settings page', () => {
        // assert
        expect(languageSettingsPage).toBeTruthy();
    });

    it('should handle interact telemetry with selectedLang and subType when from isFromSettings is false', () => {
        // arrange
        languageSettingsPage.isFromSettings = false;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        languageSettingsPage.generateClickInteractEvent('en', 'continue-clicked');
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            'continue-clicked',
            Environment.ONBOARDING,
            PageId.ONBOARDING_LANGUAGE_SETTING,
            undefined,
            { selectedLanguage: 'en' }
        );
    });

    it('should handle interact telemetry with selectedLang and subType when isFromSettings is true', () => {
        // arrange
        languageSettingsPage.isFromSettings = true;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        languageSettingsPage.generateClickInteractEvent('en', 'continue-clicked');
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            'continue-clicked',
            Environment.SETTINGS,
            PageId.SETTINGS_LANGUAGE,
            undefined,
            { selectedLanguage: 'en' }
        );
    });

    it('should generate interact telemetry after language success when isFromSettings is false', () => {
        // arrange
        languageSettingsPage.isFromSettings = false;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        languageSettingsPage.generateLanguageSuccessInteractEvent('hi', 'en');
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.LANGUAGE_SETTINGS_SUCCESS,
            Environment.ONBOARDING,
            PageId.ONBOARDING_LANGUAGE_SETTING,
            undefined,
            { previousLanguage: 'hi', currentLanguage: 'en' }
        );
    });

    it('should generate interact telemetry after language success when isFromSettings is true', () => {
        // arrange
        languageSettingsPage.isFromSettings = true;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        languageSettingsPage.generateLanguageSuccessInteractEvent('', 'en');
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.LANGUAGE_SETTINGS_SUCCESS,
            Environment.SETTINGS,
            PageId.SETTINGS_LANGUAGE,
            undefined,
            { previousLanguage: '', currentLanguage: 'en' }
        );
    });

    it('should change the button color to default if language is not present', () => {
        // arrange
        languageSettingsPage.language = undefined;
        // act
        languageSettingsPage.onLanguageSelected();
        // assert
        expect(languageSettingsPage.btnColor).toBe('#8FC4FF');
    });

    it('should change the button color to default if language is present', (done) => {
        // arrange
        languageSettingsPage.language = 'en';
        mockNgZone.run = jest.fn((fn) => fn());
        mockTranslateService.use = jest.fn();
        // act
        languageSettingsPage.onLanguageSelected();
        // assert
        setTimeout(() => {
            expect(mockTranslateService.use).toHaveBeenCalledWith('en');
            expect(languageSettingsPage.btnColor).toBe('#006DE5');
            expect(languageSettingsPage.isLanguageSelected).toBe(true);
            done();
        }, 0);
    });

    it('should call set initial available languages and call getString method from ' +
        'sharedPreferences to check if language available or not', (done) => {
            // arrange
            languageSettingsPage.languages = appLanguages;
            mockNgZone.run = jest.fn((fn) => fn());
            mockPreferences.getString = jest.fn(() => of('en'));
            // act
            languageSettingsPage.init();
            // assert
            setTimeout(() => {
                expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE_CODE);
                expect(languageSettingsPage.previousLanguage).toBe('en');
                expect(languageSettingsPage.language).toBe('en');
                done();
            }, 0);
        });
    it('should call set initial available languages and call getString method from ' +
        'sharedPreferences to check if language is undefined', (done) => {
            // arrange
            languageSettingsPage.languages = appLanguages;
            mockNgZone.run = jest.fn((fn) => fn());
            mockPreferences.getString = jest.fn(() => of(undefined));
            // act
            languageSettingsPage.init();
            // assert
            setTimeout(() => {
                expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE_CODE);
                expect(languageSettingsPage.previousLanguage).toBe(undefined);
                done();
            }, 0);
        });

    it('should generate telemetry events and set in preferences, setLocationNotification service and navigate', (done) => {
        // arrange
        languageSettingsPage.isLanguageSelected = true;
        languageSettingsPage.isFromSettings = false;
        languageSettingsPage.previousLanguage = 'hi';
        jest.spyOn(languageSettingsPage, 'generateClickInteractEvent').mockImplementation();
        jest.spyOn(languageSettingsPage, 'generateLanguageSuccessInteractEvent').mockImplementation();
        languageSettingsPage.languages = [{ code: 'en', label: 'English' }];
        languageSettingsPage.language = 'en';
        languageSettingsPage.selectedLanguage = { code: 'en' };
        mockPreferences.putString = jest.fn(() => of(undefined));
        mockTranslateService.use = jest.fn();
        mockEvents.publish = jest.fn();
        mockNotificationService.setupLocalNotification = jest.fn();
        mockNativeTransitions.slide = jest.fn();
        mockRouter.navigate = jest.fn();
        mockLocation.back = jest.fn();
        // act
        languageSettingsPage.continue();
        // assert
        expect(languageSettingsPage.generateClickInteractEvent).toHaveBeenCalledWith('en', 'continue-clicked');
        expect(languageSettingsPage.generateLanguageSuccessInteractEvent).toHaveBeenCalledWith('hi', 'en');
        setTimeout(() => {
            expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE_CODE, 'en');
            expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE, 'English');
            expect(mockTranslateService.use).toHaveBeenCalledWith('en');
            expect(mockEvents.publish).toHaveBeenCalledWith('onAfterLanguageChange:update', { selectedLanguage: 'en' });
            expect(mockNotificationService.setupLocalNotification).toHaveBeenCalledWith('en');
            expect(mockNativeTransitions.slide).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.USER_TYPE_SELECTION]);
            done();
        }, 0);
    });

    it('should generate telemetry events and set in preferences, and isFromSettings is true then location.backFired', (done) => {
        // arrange
        languageSettingsPage.isLanguageSelected = true;
        languageSettingsPage.isFromSettings = true;
        languageSettingsPage.previousLanguage = 'hi';
        jest.spyOn(languageSettingsPage, 'generateClickInteractEvent').mockImplementation();
        jest.spyOn(languageSettingsPage, 'generateLanguageSuccessInteractEvent').mockImplementation();
        languageSettingsPage.languages = [{ code: 'en', label: 'English' }];
        languageSettingsPage.language = 'en';
        languageSettingsPage.selectedLanguage = { code: 'en' };
        mockPreferences.putString = jest.fn(() => of(undefined));
        mockTranslateService.use = jest.fn();
        mockEvents.publish = jest.fn();
        mockNotificationService.setupLocalNotification = jest.fn();
        mockLocation.back = jest.fn();
        // act
        languageSettingsPage.continue();
        // assert
        expect(languageSettingsPage.generateClickInteractEvent).toHaveBeenCalledWith('en', 'continue-clicked');
        expect(languageSettingsPage.generateLanguageSuccessInteractEvent).toHaveBeenCalledWith('hi', 'en');
        setTimeout(() => {
            expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE_CODE, 'en');
            expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE, 'English');
            expect(mockTranslateService.use).toHaveBeenCalledWith('en');
            expect(mockEvents.publish).toHaveBeenCalledWith('onAfterLanguageChange:update', { selectedLanguage: 'en' });
            expect(mockNotificationService.setupLocalNotification).toHaveBeenCalledWith('en');
            expect(mockLocation.back).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should go to else part if isLanguageSelected is undefined', () => {
        // arrange
        languageSettingsPage.isLanguageSelected = false;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockCommonUtilService.showToast = jest.fn();
        mockCommonUtilService.translateMessage = jest.fn();
        // act
        languageSettingsPage.continue();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.DISABLED,
            '',
            Environment.ONBOARDING,
            PageId.ONBOARDING_LANGUAGE_SETTING,
            undefined,
            undefined,
            undefined,
            undefined,
            ID.CONTINUE_CLICKED
        );
        expect(languageSettingsPage.btnColor).toBe('#8FC4FF');
        expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ⓘ undefined', false, 'redErrorToast');
    });

    it('should cover else part if this.language is false or undefined', (done) => {
        // arrange
        languageSettingsPage.isLanguageSelected = true;
        languageSettingsPage.language = undefined;
        jest.spyOn(languageSettingsPage, 'generateClickInteractEvent').mockImplementation();
        jest.spyOn(languageSettingsPage, 'generateLanguageSuccessInteractEvent').mockImplementation();
        mockEvents.publish = jest.fn();
        mockNotificationService.setupLocalNotification = jest.fn();
        mockLocation.back = jest.fn();
        languageSettingsPage.isFromSettings = true;

        // act
        languageSettingsPage.continue();
        // assert
        expect(languageSettingsPage.generateClickInteractEvent).toHaveBeenCalledWith(undefined, 'continue-clicked');
        expect(languageSettingsPage.generateLanguageSuccessInteractEvent).toHaveBeenCalledWith('hi', undefined);
        setTimeout(() => {
            expect(mockEvents.publish).toHaveBeenCalledWith('onAfterLanguageChange:update', { selectedLanguage: undefined });
            expect(mockNotificationService.setupLocalNotification).toHaveBeenCalledWith(undefined);
            expect(mockLocation.back).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should generate telemetry if it isFromSettings is true', () => {
        // arrange
        languageSettingsPage.isFromSettings = true;
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        languageSettingsPage.handleHeaderEvents({ name: 'back' });
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.SETTINGS_LANGUAGE,
            Environment.SETTINGS,
            true
        );
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should generate telemetry if it isFromSettings is false', () => {
        // arrange
        languageSettingsPage.isFromSettings = false;
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        languageSettingsPage.handleHeaderEvents({ name: 'back' });
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.ONBOARDING_LANGUAGE_SETTING,
            Environment.ONBOARDING,
            true
        );
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should go to else part if event.name doesnt matches', () => {
        // arrange
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        languageSettingsPage.handleHeaderEvents({ name: undefined });
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).not.toHaveBeenCalled();
        expect(mockLocation.back).not.toHaveBeenCalled();
    });

    it('should handle subscription when method is called and isFromSettings is false', () => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;
        languageSettingsPage.isFromSettings = false;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockCommonUtilService.showExitPopUp = jest.fn();
        // act
        languageSettingsPage.handleBackButton();
        // assert
        expect(mockPlatform.backButton.subscribeWithPriority).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.DEVICE_BACK_CLICKED,
            Environment.ONBOARDING,
            PageId.ONBOARDING_LANGUAGE_SETTING
        );
        expect(mockCommonUtilService.showExitPopUp).toHaveBeenCalledWith(
            'onboarding-language-setting',
            'onboarding',
            false
        );
    });

    it('should handle subscription when method is called when isFromSettings is true', () => {
        // arrange
        const subscribeWithPriorityData = jest.fn((_, fn) => fn());
        mockPlatform.backButton = {
            subscribeWithPriority: subscribeWithPriorityData,
        } as any;
        languageSettingsPage.isFromSettings = true;
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockLocation.back = jest.fn();
        // act
        languageSettingsPage.handleBackButton();
        // assert
        expect(mockPlatform.backButton.subscribeWithPriority).toHaveBeenCalled();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
            InteractType.TOUCH,
            InteractSubtype.DEVICE_BACK_CLICKED,
            Environment.SETTINGS,
            PageId.SETTINGS_LANGUAGE
        );
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should fetch isFromSettings is false from activateRoute, getAppName, generateImpressionTelemetry', (done) => {
        // arrange
        mockActivatedRoute.snapshot = {
            params: {
                isFromSettings: false
            }
        } as any;
        mockAppHeaderService.hideHeader = jest.fn();
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sample_app_name'));
        jest.spyOn(languageSettingsPage, 'init').mockImplementation();
        const data = jest.fn((fn => fn()));
        mockAppHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockRouter = { url: '/' + RouterLinks.LANGUAGE_SETTING };
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        jest.spyOn(languageSettingsPage, 'handleHeaderEvents').mockImplementation();
        jest.spyOn(languageSettingsPage, 'handleBackButton').mockImplementation();
        // act
        languageSettingsPage.ionViewWillEnter();
        // assert
        expect(mockAppHeaderService.hideHeader).toHaveBeenCalled();
        setTimeout(() => {
            expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                '',
                PageId.ONBOARDING_LANGUAGE_SETTING,
                Environment.ONBOARDING
            );
            expect(languageSettingsPage.init).toHaveBeenCalled();
            expect(languageSettingsPage.handleBackButton).toHaveBeenCalled();
            expect(languageSettingsPage.handleHeaderEvents).toHaveBeenCalled();
            done();
        }, 450);
    });

    it('should fetch isFromSettings is true from activateRoute, getAppName, generateImpressionTelemetry', (done) => {
        // arrange
        if (mockRouter.url === '/' + RouterLinks.LANGUAGE_SETTING + '/' + 'true') {
            mockRouter = { url: '/' + RouterLinks.LANGUAGE_SETTING };
        }
        mockActivatedRoute.snapshot = {
            params: {
                isFromSettings: true
            }
        } as any;
        mockAppHeaderService.showHeaderWithBackButton = jest.fn();
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sample_app_name'));
        jest.spyOn(languageSettingsPage, 'init').mockImplementation();
        const data = jest.fn((fn => fn()));
        mockAppHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;

        jest.spyOn(languageSettingsPage, 'handleHeaderEvents').mockImplementation();
        jest.spyOn(languageSettingsPage, 'handleBackButton').mockImplementation();
        // act
        languageSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
            expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
            expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(
                ImpressionType.VIEW,
                '',
                PageId.SETTINGS_LANGUAGE,
                Environment.SETTINGS
            );
            expect(languageSettingsPage.init).toHaveBeenCalled();
            expect(languageSettingsPage.handleBackButton).toHaveBeenCalled();
            expect(languageSettingsPage.handleHeaderEvents).toHaveBeenCalled();
            done();
        }, 450);
    });

    it('should handle if conditions in ionViewWillLeave()', async () => {
        // arrange
        languageSettingsPage.isLanguageSelected = true;
        languageSettingsPage.languages = [{ code: 'en', label: 'English' }];
        languageSettingsPage.selectedLanguage = { code: undefined };
        languageSettingsPage.previousLanguage = 'hi';
        mockTranslateService.use = jest.fn();
        languageSettingsPage.unregisterBackButton = {
            unsubscribe: jest.fn()
        } as any
        // act
        languageSettingsPage.ionViewWillLeave();
        // assert
        expect(mockTranslateService.use).toHaveBeenCalledWith('hi');
    });

    it('should handle if inside if previous language is undefined set to english', async() => {
        // arrange
        languageSettingsPage.isLanguageSelected = true;
        languageSettingsPage.languages = [{ code: 'en', label: 'English' }];
        languageSettingsPage.selectedLanguage = { code: undefined };
        languageSettingsPage.previousLanguage = undefined;
        mockTranslateService.use = jest.fn();
        // act
        languageSettingsPage.ionViewWillLeave();
        // assert
        expect(mockTranslateService.use).toHaveBeenCalledWith('en');
    });

    it('should cover else part if selectedLanguage.code is already set', async() => {
        // arrange
        languageSettingsPage.isLanguageSelected = true;
        languageSettingsPage.languages = [{ code: 'en', label: 'English' }];
        languageSettingsPage.selectedLanguage = { code: 'en' };
        languageSettingsPage.previousLanguage = undefined;
        mockTranslateService.use = jest.fn();
        // act
        languageSettingsPage.ionViewWillLeave();
        // assert
        expect(mockTranslateService.use).not.toHaveBeenCalledWith('en');
    });
    it('should cover else part if isLanguageSelected is false', () => {
        // arrange
        languageSettingsPage.isLanguageSelected = false;
        const unsubscribe = jest.fn();
        languageSettingsPage.headerObservable = {
            unsubscribe
        };
        languageSettingsPage.unregisterBackButton = {
            unsubscribe
        };
        mockTranslateService.use = jest.fn();
        // act
        languageSettingsPage.ionViewWillLeave();
        // assert
        expect(mockTranslateService.use).not.toHaveBeenCalledWith('en');
        expect(unsubscribe).toBeCalledTimes(2);
    });


    describe('ionViewDidEnter', () => {
        it('should hide the header if isFromSettings is false', (done) => {
            // arrange
            mockActivatedRoute.params = of({ isFromSettings: false });
            mockPreferences.putString = jest.fn(() => of('JOYFUL'));
            mockAppHeaderService.showStatusBar = jest.fn();

            // act
            languageSettingsPage.ionViewDidEnter();
            // assert
            setTimeout(() => {
                expect(mockAppHeaderService.hideHeader).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should show header with Back button  if isFromSettings is true', () => {
            // arrange
            mockActivatedRoute.params = of({ isFromSettings: true });

            // act
            languageSettingsPage.ionViewDidEnter();
            // assert
            expect(mockAppHeaderService.showHeaderWithBackButton).toHaveBeenCalled();
        });
    });

});

describe('LanguageSettingsPage', () => {
    let languageSettingsPage: LanguageSettingsPage;

    const mockPreferences: Partial<SharedPreferences> = {};

    const mockTranslateService: Partial<TranslateService> = {};

    const mockEvents: Partial<Events> = {};

    const mockNgZone: Partial<NgZone> = {
        run: jest.fn()
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateAuditTelemetry: jest.fn(),
        generatePageLoadedTelemetry: jest.fn(),
        generateInteractTelemetry: jest.fn()
    };

    const mockPlatform: Partial<Platform> = {};

    const mockCommonUtilService: Partial<CommonUtilService> = {};

    const mockAppHeaderService: Partial<AppHeaderService> = {
        hideHeader: jest.fn(),
        showHeaderWithBackButton: jest.fn()
    };

    const mockNotificationService: Partial<NotificationService> = {};

    let mockRouter: Partial<Router> = {
        url: '/' + RouterLinks.LANGUAGE_SETTING + '/' + 'true'
    };

    const mockLocation: Partial<Location> = {};

    const mockActivatedRoute: Partial<ActivatedRoute> = {
    };

    const mockNativeTransitions: Partial<NativePageTransitions> = {};
    const mockOnBoardingConfigService: Partial<OnboardingConfigurationService> = {
        getOnboardingConfig: jest.fn(() => mockOnboardingConfigData.onboarding[0] as any)
    };

    beforeAll(() => {
        languageSettingsPage = new LanguageSettingsPage(
            mockPreferences as SharedPreferences,
            mockTranslateService as TranslateService,
            mockEvents as Events,
            mockNgZone as NgZone,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockPlatform as Platform,
            mockCommonUtilService as CommonUtilService,
            mockAppHeaderService as AppHeaderService,
            mockNotificationService as NotificationService,
            mockRouter as Router,
            mockLocation as Location,
            mockActivatedRoute as ActivatedRoute,
            mockNativeTransitions as NativePageTransitions,
            mockOnBoardingConfigService as OnboardingConfigurationService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not generate any telemetry if router ur is not langauge settings', (done) => {
        // arrange
        mockActivatedRoute.snapshot = {
            params: {
                isFromSettings: false
            }
        } as any;
        mockAppHeaderService.hideHeader = jest.fn();
        mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sample_app_name'));
        jest.spyOn(languageSettingsPage, 'init').mockImplementation();
        const data = jest.fn((fn => fn()));
        mockAppHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        mockRouter.url = '/' + RouterLinks.RESOURCES;
        mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
        jest.spyOn(languageSettingsPage, 'handleHeaderEvents').mockImplementation();
        jest.spyOn(languageSettingsPage, 'handleBackButton').mockImplementation();
        // act
        languageSettingsPage.ionViewWillEnter();
        // assert
        setTimeout(() => {
            expect(mockTelemetryGeneratorService.generatePageLoadedTelemetry).not.toHaveBeenCalled();
            done();
        }, 450);
    });

    it('should generate telemetry with tapped language in cdata', () => {
        // arrange
        languageSettingsPage.tappedLanguage = 'en';
        languageSettingsPage.language = 'hi';
        languageSettingsPage.isFromSettings = false;
        // act
        languageSettingsPage.onLanguageSelected();
        // assert
        const cData: CorrelationData[] = [{
            id: 'hi',
            type: CorReleationDataType.NEW_VALUE
          },
          {
            id: 'en',
            type: CorReleationDataType.OLD_VALUE
          }];
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.SELECT_LANGUAGE, '',
            Environment.ONBOARDING,
            PageId.LANGUAGE,
            undefined,
            undefined,
            undefined,
            cData);
    });

});