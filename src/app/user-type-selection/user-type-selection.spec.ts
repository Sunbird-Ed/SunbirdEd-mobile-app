import { UserTypeSelectionPage } from './user-type-selection';
import {
    ProfileService,
    SharedPreferences
} from '@project-sunbird/sunbird-sdk';
import { Platform } from '@ionic/angular';
import { Events } from '../../util/events';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    ContainerService,
    AppHeaderService,
    AuditProps,
    AuditType,
    OnboardingConfigurationService
} from '../../services';
import { of, throwError } from 'rxjs';
import { NgZone } from '@angular/core';
import { HasNotSelectedFrameworkGuard } from '../../guards/has-not-selected-framework.guard';
import { NativePageTransitions } from '@awesome-cordova-plugins/native-page-transitions/ngx';
import {
    CorReleationDataType, Environment, InteractSubtype, InteractType, LoginHandlerService, PageId,
    SplashScreenService
} from '../../services';
import { AuditState, CorrelationData, ProfileType } from '@project-sunbird/sunbird-sdk';
import { OnboardingScreenType, PreferenceKey, RouterLinks } from '../app.constant';
import { ProfileHandler } from '../../services/profile-handler';
import { TncUpdateHandlerService } from '../../services/handlers/tnc-update-handler.service';
import { ExternalIdVerificationService } from '../../services/externalid-verification.service';

describe('UserTypeSelectionPage', () => {
    let userTypeSelectionPage: UserTypeSelectionPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {
        generateSaveClickedTelemetry: jest.fn(),
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {
        translateMessage: jest.fn(() => 'sample_translated_message'),
        showToast: jest.fn()
    };
    const mockContainer: Partial<ContainerService> = {};
    const mockEvents: Partial<Events> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockProfileService: Partial<ProfileService> = {
        updateProfile: jest.fn(() => of({})),
        setActiveSessionForProfile: jest.fn(() => of({})),
        getActiveSessionProfile: jest.fn(() => Promise.resolve({}))
    };
    const mockRouterExtras = {
        extras: {
            state: {
                contentType: 'contentType',
                corRelationList: 'corRelationList',
                source: 'source',
                enrolledCourses: 'enrolledCourses' as any,
                userId: 'userId',
                shouldGenerateEndTelemetry: false,
                isNewUser: true,
                lastCreatedProfile: { id: 'sample-id' }
            }
        }
    };
    const mockRouter: Partial<Router> = {
        getCurrentNavigation: jest.fn(() => mockRouterExtras as any),
        navigate: jest.fn(() => Promise.resolve(true))
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn(),
        generateImpressionTelemetry: jest.fn()
    };
    const mockActivatedRoute: Partial<ActivatedRoute> = {};
    mockActivatedRoute.snapshot = {
        queryParams: {
            reOnBoard: {}
        }
    } as any;
    const mockSharedPreferences: Partial<SharedPreferences> = {
    };

    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };

    const mockPlatform: Partial<Platform> = {
    };

    const mockHasNotSelectedFrameworkGuard: Partial<HasNotSelectedFrameworkGuard> = {
    };

    const mockSplashScreenService: Partial<SplashScreenService> = {
    };

    const mockNativePageTransitions: Partial<NativePageTransitions> = {
    };
    const mockTncUpdateHandlerService: Partial<TncUpdateHandlerService> = {};
    const mockProfileHandler: Partial<ProfileHandler> = {};
    const mockLoginHandlerService: Partial<LoginHandlerService> = {};
    const mockOnboardingConfigurationService: Partial<OnboardingConfigurationService> = {};
    const mockExternalIdVerificationService: Partial<ExternalIdVerificationService> = {};
    window.console.error = jest.fn()

    beforeAll(() => {
        userTypeSelectionPage = new UserTypeSelectionPage(
            mockProfileService as ProfileService,
            mockSharedPreferences as SharedPreferences,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockContainer as ContainerService,
            mockNgZone as NgZone,
            mockEvents as Events,
            mockCommonUtilService as CommonUtilService,
            mockAppGlobalService as AppGlobalService,
            mockPlatform as Platform,
            mockHeaderService as AppHeaderService,
            mockRouter as Router,
            mockHasNotSelectedFrameworkGuard as HasNotSelectedFrameworkGuard,
            mockSplashScreenService as SplashScreenService,
            mockNativePageTransitions as NativePageTransitions,
            mockTncUpdateHandlerService as TncUpdateHandlerService,
            mockProfileHandler as ProfileHandler,
            mockLoginHandlerService as LoginHandlerService,
            mockOnboardingConfigurationService as OnboardingConfigurationService,
            mockExternalIdVerificationService as ExternalIdVerificationService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of UserTypeSelectionPage', () => {
        expect(userTypeSelectionPage).toBeTruthy();
    });

    describe('selectUserTypeCard', () => {
        it('should update the selectedUserType , continueAs Message and save the userType in preference', () => {
            // arrange
            userTypeSelectionPage['profile'] = { uid: 'sample_uid' };
            jest.useFakeTimers();
            window.setTimeout = jest.fn((fn) => {
                fn();
            }, 30) as any
            mockProfileService.updateProfile = jest.fn(() => of({}));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                uid: 'sample-uid',
                handle: 'USER'
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            userTypeSelectionPage.selectUserTypeCard('USER_TYPE_1', ProfileType.TEACHER, true);
            // assert
            expect(userTypeSelectionPage.selectedUserType).toEqual(ProfileType.TEACHER);
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'USER_TYPE_1');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'CONTINUE_AS_ROLE', undefined);
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER);
            jest.useRealTimers();
            jest.clearAllTimers();
        });

        it('should update the selectedUserType , if onboarding complted', () => {
            // arrange
            userTypeSelectionPage['profile'] = { uid: 'sample_uid' };
            jest.useFakeTimers();
            window.setTimeout = jest.fn((fn) => {
                fn();
            }, 30) as any
            mockProfileService.updateProfile = jest.fn(() => of({}));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                uid: 'sample-uid',
                handle: 'USER'
            }));
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockNgZone.run = jest.fn((fn) => fn());
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            userTypeSelectionPage.selectUserTypeCard('USER_TYPE_1', ProfileType.TEACHER, true);
            // assert
            expect(userTypeSelectionPage.selectedUserType).toEqual(ProfileType.TEACHER);
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'USER_TYPE_1');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'CONTINUE_AS_ROLE', undefined);
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER);
            jest.useRealTimers();
            jest.clearAllTimers();
        });

        it('should update the selectedUserType , if onboarding complted', () => {
            // arrange
            userTypeSelectionPage.categoriesProfileData = {status: true, showOnlyMandatoryFields: false};
            userTypeSelectionPage['profile'] = { uid: 'sample_uid' };
            jest.useFakeTimers();
            window.setTimeout = jest.fn((fn) => {
                fn();
            }, 30) as any
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockNgZone.run = jest.fn((fn) => fn());
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            userTypeSelectionPage.selectUserTypeCard('USER_TYPE_1', ProfileType.TEACHER, true);
            // assert
            expect(userTypeSelectionPage.selectedUserType).toEqual(ProfileType.TEACHER);
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'USER_TYPE_1');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'CONTINUE_AS_ROLE', undefined);
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER);
            jest.useRealTimers();
            jest.clearAllTimers();
        });

        it('should update the selectedUserType , return if isActive false else case', () => {
            // arrange
            // act
            userTypeSelectionPage.selectUserTypeCard('USER_TYPE_1', ProfileType.TEACHER, false);
            // assert
        });
    });

    it('should return categories ProfileData', () => {
        jest.spyOn(window.history, 'state', 'get').mockImplementation(() => {
            return { categoriesProfileData: {}, forwardMigration: true };
        });
        // act
        userTypeSelectionPage.getNavParams();
        // assert
        expect(userTypeSelectionPage.categoriesProfileData).toBeTruthy();
    });

    it('should invoked onboarding Splash screen', () => {
        mockSplashScreenService.handleSunbirdSplashScreenActions = jest.fn(() => Promise.resolve(undefined));
        userTypeSelectionPage.ionViewDidEnter();
        expect(mockSplashScreenService.handleSunbirdSplashScreenActions).toHaveBeenCalled();
    });

    it('should not invok onboarding Splash screen, if guardActivated', () => {
        userTypeSelectionPage.frameworkGuard.guardActivated = true;
        mockSplashScreenService.handleSunbirdSplashScreenActions = jest.fn(() => Promise.resolve(undefined));
        userTypeSelectionPage.ionViewDidEnter();
    });

    it('should invoked onboarding Splash screen, handle else case if not forward migrated', () => {
        userTypeSelectionPage.frameworkGuard.guardActivated = true;
        userTypeSelectionPage['navParams'] = { categoriesProfileData: {}, forwardMigration: false };
        mockSplashScreenService.handleSunbirdSplashScreenActions = jest.fn(() => Promise.resolve(undefined));
        userTypeSelectionPage.ionViewDidEnter();
    });

    describe('handleBackButton', () => {
        it('should not navigate to language settings page for onboarding completed', () => {
            // arrange
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            userTypeSelectionPage.categoriesProfileData = true;
            // act
            userTypeSelectionPage.handleBackButton(true);
            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.USER_TYPE_SELECTION,
                Environment.HOME,
                true);
            expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                false,
                Environment.HOME,
                PageId.USER_TYPE);
        });

        it('should navigate to language settings page for onboarding', () => {
            // arrange
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockAppGlobalService.isOnBoardingCompleted = false;
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            userTypeSelectionPage.categoriesProfileData = false;
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            userTypeSelectionPage.handleBackButton(true);
            // assert
            expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                PageId.USER_TYPE_SELECTION,
                Environment.ONBOARDING,
                true);
            expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                false,
                Environment.ONBOARDING,
                PageId.USER_TYPE);
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.LANGUAGE_SETTING}`]);
        });

        it('should not generated telemetry if back clicked is not trigger', () => {
            userTypeSelectionPage.categoriesProfileData = false;
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            userTypeSelectionPage.handleBackButton(false);
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.LANGUAGE_SETTING}`]);
        });
    });

    it('should invoked backButton', () => {
        // arrange
        const event = { name: 'back' };
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        jest.spyOn(userTypeSelectionPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        // act
        userTypeSelectionPage.handleHeaderEvents(event);
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.USER_TYPE_SELECTION,
            Environment.ONBOARDING,
            true);
    });

    it('should invoked backButton', () => {
        // arrange
        const event = { name: 'back' };
        mockAppGlobalService.isOnBoardingCompleted = true;
        mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
        jest.spyOn(userTypeSelectionPage, 'handleBackButton').mockImplementation(() => {
            return;
        });
        // act
        userTypeSelectionPage.handleHeaderEvents(event);
        // assert
        expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
            PageId.USER_TYPE_SELECTION,
            Environment.HOME,
            true);
    });

    it('should invoked backButton, if event name is not back', () => {
        // arrange
        const event = { name: 'exit' };
        // act
        userTypeSelectionPage.handleHeaderEvents(event);
        // assert
    });

    describe('setUserTypeForNewUser', () => {
        it('should update userType for new user', () => {
            // arrange
            userTypeSelectionPage.selectedUserType = 'none';
            mockCommonUtilService.getGuestUserConfig = jest.fn(() => Promise.resolve({
                profileType: 'sample-profile'
            }));
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            userTypeSelectionPage.setUserTypeForNewUser();
            // assert
            window.setTimeout = jest.fn(() => {
                expect(userTypeSelectionPage.selectedUserType).toBe('sample-profile');
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith(
                    PreferenceKey.SELECTED_USER_TYPE,
                    'sample-profile'
                );
                expect(userTypeSelectionPage.isUserTypeSelected).toBeTruthy();
            }) as any;
        });

        it('should not update userType if already exists', () => {
            // arrange
            userTypeSelectionPage.selectedUserType = 'sample-user-type';
            // act
            userTypeSelectionPage.setUserTypeForNewUser();
            // assert
            window.setTimeout = jest.fn(() => {
                expect(userTypeSelectionPage.isUserTypeSelected).toBeTruthy();
            }) as any;
        });
    });

    describe('ionViewWillEnter', () => {
        it('should initialized all user-type', () => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockProfileHandler.getSupportedUserTypes = jest.fn(() => Promise.resolve([]));
            (mockRouter as any).url = `/${RouterLinks.USER_TYPE_SELECTION}`;
            window.setTimeout = jest.fn((fn) => {
                fn({});
            }, 350) as any
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            jest.spyOn(userTypeSelectionPage, 'getNavParams').mockImplementation(() => {
                return;
            });
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn((fn) => fn({
                    unsubscribe: jest.fn(() => { })
                }))
            });
            jest.spyOn(userTypeSelectionPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            jest.spyOn(userTypeSelectionPage, 'handleBackButton').mockImplementation(() => {
                return;
            });
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sunbird'));
            mockCommonUtilService.showExitPopUp = jest.fn();
            mockHeaderService.hideHeader = jest.fn();
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ handle: 'sample-user' }));
            const subscribeWithPriorityData = jest.fn((_, fn) => fn({
                unsubscribe: jest.fn()
            }));
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            jest.spyOn(userTypeSelectionPage, 'handleBackButton').mockImplementation(() => {
                return;
            });
            userTypeSelectionPage.backButtonFunc = {
                unsubscribe: jest.fn()
            } as any;
            // act /assert
            userTypeSelectionPage.ionViewWillEnter().then(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockProfileHandler.getSupportedUserTypes).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).toBeTruthy();
                expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
                expect(mockHeaderService.hideHeader).toHaveBeenCalled();
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(subscribeWithPriorityData).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.USER_TYPE_SELECTION, Environment.HOME, false
                );

                expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                    true,
                    Environment.HOME,
                    PageId.USER_TYPE
                );
            });
        });

        it('should initialized all user-type, on boarding completed users', () => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockProfileHandler.getSupportedUserTypes = jest.fn(() => Promise.resolve([]));
            (mockRouter as any).url = `/${RouterLinks.USER_TYPE_SELECTION}`;
            window.setTimeout = jest.fn((fn) => {
                fn({});
            }, 350) as any
            mockAppGlobalService.isOnBoardingCompleted = false;
            mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockTelemetryGeneratorService.generatePageLoadedTelemetry = jest.fn();
            jest.spyOn(userTypeSelectionPage, 'getNavParams').mockImplementation(() => {
                return;
            });
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn((fn) => fn({
                    unsubscribe: jest.fn(() => { })
                }))
            });
            jest.spyOn(userTypeSelectionPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            jest.spyOn(userTypeSelectionPage, 'handleBackButton').mockImplementation(() => {
                return;
            });
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sunbird'));
            mockCommonUtilService.showExitPopUp = jest.fn();
            mockHeaderService.hideHeader = jest.fn();
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ handle: 'sample-user' }));
            const subscribeWithPriorityData = jest.fn((_, fn) => fn({
                unsubscribe: jest.fn()
            }));
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            jest.spyOn(userTypeSelectionPage, 'handleBackButton').mockImplementation(() => {
                return;
            });
            userTypeSelectionPage.backButtonFunc = {
                unsubscribe: jest.fn()
            } as any;
            // act /assert
            userTypeSelectionPage.ionViewWillEnter().then(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockProfileHandler.getSupportedUserTypes).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).toBeTruthy();
                expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
                expect(mockHeaderService.hideHeader).toHaveBeenCalled();
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(subscribeWithPriorityData).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.USER_TYPE_SELECTION, Environment.HOME, false
                );

                expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                    true,
                    Environment.ONBOARDING,
                    PageId.USER_TYPE
                );
            });
        });

        it('should set user for logged-in user for platform ios show header', () => {
            // arrange
            userTypeSelectionPage.categoriesProfileData = {status: true, showOnlyMandatoryFields: false};
            mockPlatform.is = jest.fn((platform) => platform === "ios");
            mockHeaderService.showHeaderWithHomeButton = jest.fn();
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockSharedPreferences.getString = jest.fn(() => of('teacher'));
            mockProfileHandler.getSupportedUserTypes = jest.fn(() => Promise.resolve([]));
            (mockRouter as any).url = `/${RouterLinks.ABOUT_US}`;
            jest.spyOn(userTypeSelectionPage, 'getNavParams').mockImplementation(() => {
                return;
            });
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn((fn) => fn({
                    unsubscribe: jest.fn(() => { })
                }))
            });
            jest.spyOn(userTypeSelectionPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            jest.spyOn(userTypeSelectionPage, 'handleBackButton').mockImplementation(() => {
                return;
            });
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sunbird'));
            mockCommonUtilService.showExitPopUp = jest.fn();
            mockHeaderService.hideHeader = jest.fn();
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ handle: 'sample-user' }));
            const subscribeWithPriorityData = jest.fn((_, fn) => fn({
                unsubscribe: jest.fn()
            }));
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            mockOnboardingConfigurationService.initialOnboardingScreenName = OnboardingScreenType.USER_TYPE_SELECTION;
            jest.spyOn(userTypeSelectionPage, 'handleBackButton').mockImplementation(() => {
                return;
            });
            userTypeSelectionPage.backButtonFunc = {
                unsubscribe: jest.fn()
            } as any;
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of());
            mockProfileService.getActiveSessionProfile = jest.fn(() => Promise.resolve());
            mockAppGlobalService.isOnBoardingCompleted = true;
            // act
            userTypeSelectionPage.ionViewWillEnter();
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
                expect(mockProfileHandler.getSupportedUserTypes).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).toBeTruthy();
                expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
                expect(mockHeaderService.hideHeader).toHaveBeenCalled();
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(subscribeWithPriorityData).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.USER_TYPE_SELECTION, Environment.HOME, false
                );

                expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                    true,
                    Environment.HOME,
                    PageId.USER_TYPE
                );
            }, 0);
        });

        it('should set user for logged-in user for platform ios show header', () => {
            // arrange
            userTypeSelectionPage.categoriesProfileData = {status: true, showOnlyMandatoryFields: false};
            mockPlatform.is = jest.fn((platform) => platform === "android");
            mockCommonUtilService.showExitPopUp = jest.fn();
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockSharedPreferences.getString = jest.fn(() => of('teacher'));
            mockProfileHandler.getSupportedUserTypes = jest.fn(() => Promise.resolve([]));
            (mockRouter as any).url = `/${RouterLinks.ABOUT_US}`;
            jest.spyOn(userTypeSelectionPage, 'getNavParams').mockImplementation(() => {
                return;
            });
            mockHeaderService.headerEventEmitted$ = of({
                subscribe: jest.fn((fn) => fn({
                    unsubscribe: jest.fn(() => { })
                }))
            });
            jest.spyOn(userTypeSelectionPage, 'handleHeaderEvents').mockImplementation(() => {
                return;
            });
            jest.spyOn(userTypeSelectionPage, 'handleBackButton').mockImplementation(() => {
                return;
            });
            mockCommonUtilService.getAppName = jest.fn(() => Promise.resolve('sunbird'));
            mockCommonUtilService.showExitPopUp = jest.fn();
            mockHeaderService.hideHeader = jest.fn();
            mockAppGlobalService.getCurrentUser = jest.fn(() => ({ handle: 'sample-user' }));
            const subscribeWithPriorityData = jest.fn((_, fn) => fn({
                unsubscribe: jest.fn()
            }));
            mockPlatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            mockTelemetryGeneratorService.generateBackClickedTelemetry = jest.fn();
            mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            mockOnboardingConfigurationService.initialOnboardingScreenName = OnboardingScreenType.USER_TYPE_SELECTION;
            jest.spyOn(userTypeSelectionPage, 'handleBackButton').mockImplementation(() => {
                return;
            });
            userTypeSelectionPage.backButtonFunc = {
                unsubscribe: jest.fn()
            } as any;
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of());
            mockProfileService.getActiveSessionProfile = jest.fn(() => Promise.resolve());
            mockAppGlobalService.isOnBoardingCompleted = false;
            // act
            userTypeSelectionPage.ionViewWillEnter();
            setTimeout(() => {
                expect(mockAppGlobalService.isUserLoggedIn).toHaveBeenCalled();
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE);
                expect(mockProfileHandler.getSupportedUserTypes).toHaveBeenCalled();
                expect(mockHeaderService.headerEventEmitted$).toBeTruthy();
                expect(mockCommonUtilService.getAppName).toHaveBeenCalled();
                expect(mockHeaderService.hideHeader).toHaveBeenCalled();
                expect(mockAppGlobalService.getCurrentUser).toHaveBeenCalled();
                expect(subscribeWithPriorityData).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateBackClickedTelemetry).toHaveBeenCalledWith(
                    PageId.USER_TYPE_SELECTION, Environment.HOME, false
                );

                expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(
                    true,
                    Environment.ONBOARDING,
                    PageId.USER_TYPE
                );
            }, 0);
        });
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe of header and backButton is undefined', () => {
            // arrange
            userTypeSelectionPage.headerObservable = {
                unsubscribe: jest.fn()
            };
            mockEvents.unsubscribe = jest.fn(() => true);
            userTypeSelectionPage.backButtonFunc = undefined;
            // act
            userTypeSelectionPage.ionViewWillLeave();
            // assert
            expect(userTypeSelectionPage.headerObservable.unsubscribe).toHaveBeenCalled();
            expect(mockEvents.unsubscribe).toHaveBeenCalled();
            expect(userTypeSelectionPage.backButtonFunc).toBeUndefined();
        });

        it('should unsubscribe of header and backButton', () => {
            // arrange
            userTypeSelectionPage.headerObservable = {
                unsubscribe: jest.fn()
            };
            mockEvents.unsubscribe = jest.fn(() => true);
            userTypeSelectionPage.backButtonFunc = {
                unsubscribe: jest.fn()
            } as any;
            // act
            userTypeSelectionPage.ionViewWillLeave();
            // assert
            expect(userTypeSelectionPage.headerObservable.unsubscribe).toHaveBeenCalled();
            expect(mockEvents.unsubscribe).toHaveBeenCalled();
            expect(userTypeSelectionPage.backButtonFunc.unsubscribe).toHaveBeenCalled();
        });
    });

    describe('navigateToTabsAsLogInUser', () => {
        it('should return birthday popup', () => {
            // arrange
            userTypeSelectionPage.categoriesProfileData = {
                status: 'active',
                showOnlyMandatoryFields: 'YES',
                hasFilledLocation: true
            };
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
            mockAppGlobalService.showYearOfBirthPopup = jest.fn(() => Promise.resolve());
            mockTelemetryGeneratorService.generateAuditTelemetry = jest.fn();
            const correlationlist: Array<CorrelationData> = [{ id: PageId.USER_TYPE, type: CorReleationDataType.FROM_PAGE }];
            correlationlist.push({ id: 'sample-user-type', type: CorReleationDataType.USERTYPE });
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockExternalIdVerificationService.showExternalIdVerificationPopup = jest.fn(() => Promise.resolve());   
            // act
            userTypeSelectionPage.navigateToTabsAsLogInUser();
            // assert
            setTimeout(() => {
                expect(mockContainer.removeAllTabs).toHaveBeenCalled();
                expect(mockContainer.addTab).toHaveBeenCalled();
                expect(mockTncUpdateHandlerService.isSSOUser).toHaveBeenCalled();
                expect(mockAppGlobalService.showYearOfBirthPopup).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.TABS]);
                expect(mockExternalIdVerificationService.showExternalIdVerificationPopup).toHaveBeenCalled();
            }, 0);
        });

        it('should return birthday popup, isJoinTraningOnboardingFlow', () => {
            // arrange
            userTypeSelectionPage.categoriesProfileData = {
                status: 'active',
                showOnlyMandatoryFields: 'YES',
                hasFilledLocation: true,
                noOfStepsToCourseToc: 2
            };
            mockAppGlobalService.isJoinTraningOnboardingFlow = true;
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
            mockAppGlobalService.showYearOfBirthPopup = jest.fn(() => Promise.resolve());
            window.history = {
                go: jest.fn()
            } as any;
            mockExternalIdVerificationService.showExternalIdVerificationPopup = jest.fn(() => Promise.resolve());
            // act
            userTypeSelectionPage.navigateToTabsAsLogInUser();
            // assert
            setTimeout(() => {
                expect(mockContainer.removeAllTabs).toHaveBeenCalled();
                expect(mockContainer.addTab).toHaveBeenCalled();
                expect(mockTncUpdateHandlerService.isSSOUser).toHaveBeenCalled();
                expect(mockAppGlobalService.showYearOfBirthPopup).toHaveBeenCalled();
                expect(mockExternalIdVerificationService.showExternalIdVerificationPopup).toHaveBeenCalled();
            }, 0);
        });

        it('should return birthday popup, if ssouser', () => {
            // arrange
            userTypeSelectionPage.categoriesProfileData = {
                status: 'active',
                showOnlyMandatoryFields: 'YES',
                hasFilledLocation: true,
                noOfStepsToCourseToc: 2
            };
            mockAppGlobalService.isJoinTraningOnboardingFlow = true;
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(true));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockExternalIdVerificationService.showExternalIdVerificationPopup = jest.fn(() => Promise.resolve());
            // act
            userTypeSelectionPage.navigateToTabsAsLogInUser();
            // assert
            setTimeout(() => {
                expect(mockContainer.removeAllTabs).toHaveBeenCalled();
                expect(mockContainer.addTab).toHaveBeenCalled();
                expect(mockTncUpdateHandlerService.isSSOUser).toHaveBeenCalled();
                expect(mockExternalIdVerificationService.showExternalIdVerificationPopup).toHaveBeenCalled();
            }, 0);
        });

        it('should return birthday popup, return if no mandatory fileds', () => {
            // arrange
            userTypeSelectionPage.categoriesProfileData = {
                status: 'active',
                showOnlyMandatoryFields: '',
                hasFilledLocation: true
            };
            // act
            userTypeSelectionPage.navigateToTabsAsLogInUser();
            // assert
            setTimeout(() => {
            }, 0);
        });

        it('should navigate to location page', () => {
            // arrange
            userTypeSelectionPage.categoriesProfileData = {
                status: 'active',
                showOnlyMandatoryFields: 'YES',
                hasFilledLocation: false
            };
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockTncUpdateHandlerService.isSSOUser = jest.fn(() => Promise.resolve(false));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            const navigationExtras: NavigationExtras = {
                state: {
                  isShowBackButton: false,
                  noOfStepsToCourseToc: NaN
                }
              };
            // act
            userTypeSelectionPage.navigateToTabsAsLogInUser();
            // assert
            setTimeout(() => {
                expect(mockContainer.removeAllTabs).toHaveBeenCalled();
                expect(mockContainer.addTab).toHaveBeenCalled();
                expect(mockTncUpdateHandlerService.isSSOUser).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.DISTRICT_MAPPING], navigationExtras);
            }, 0);
        });

        it('should navigate to category edit page', () => {
            // arrange
            userTypeSelectionPage.categoriesProfileData = {
                status: false,
                showOnlyMandatoryFields: 'YES',
                hasFilledLocation: false
            };
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            userTypeSelectionPage.navigateToTabsAsLogInUser();
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('updateProfile', () => {
        it('should navigate to tabs as guest', () => {
            // arrange
            userTypeSelectionPage.selectedUserType = 'sample-user';
            mockProfileService.updateProfile = jest.fn(() => of({}));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
            mockProfileService.updateServerProfile = jest.fn(() => of({}));
            // act
            userTypeSelectionPage.updateProfile('TabsPage', {});
            // assert
            setTimeout(() => {
                expect(mockProfileService.updateProfile).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in']);
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
            }, 0);
        });

        it('should navigate To Tabs As LogInUser', () => {
            // arrange
            userTypeSelectionPage.selectedUserType = 'sample-user';
            mockProfileService.updateProfile = jest.fn(() => of({}));
            userTypeSelectionPage.categoriesProfileData = {};
            mockProfileService.updateServerProfile = jest.fn(() => of({}));
            jest.spyOn(userTypeSelectionPage, 'navigateToTabsAsLogInUser').mockImplementation(() => {
                return Promise.resolve();
            });
            // act
            userTypeSelectionPage.updateProfile('sample-page', {});
            // assert
            setTimeout(() => {
                expect(mockProfileService.updateProfile).toHaveBeenCalled();
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
            }, 0);
        });

        it('should navigate To signIn page', () => {
            // arrange
            userTypeSelectionPage.selectedUserType = ProfileType.ADMIN;
            mockProfileService.updateProfile = jest.fn(() => of({}));
            userTypeSelectionPage.categoriesProfileData = undefined;
            mockProfileService.updateServerProfile = jest.fn(() => throwError({error: {}}));
            jest.spyOn(userTypeSelectionPage, 'navigateToTabsAsLogInUser').mockImplementation(() => {
                return Promise.resolve();
            });
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            userTypeSelectionPage.updateProfile('sample-page');
            // assert
            setTimeout(() => {
                expect(mockProfileService.updateProfile).toHaveBeenCalled();
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN]);
            }, 0);
        });

        it('should navigate To ProfileSettingsPage', () => {
            // arrange
            userTypeSelectionPage.selectedUserType = ProfileType.TEACHER;
            mockProfileService.updateProfile = jest.fn(() => of({}));
            userTypeSelectionPage.categoriesProfileData = undefined;
            mockProfileService.updateServerProfile = jest.fn(() => throwError({error: {}}));
            jest.spyOn(userTypeSelectionPage, 'navigateToTabsAsLogInUser').mockImplementation(() => {
                return Promise.resolve();
            });
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            mockNativePageTransitions.slide = jest.fn(() => Promise.resolve());
            // act
            userTypeSelectionPage.updateProfile('sample-page', {});
            // assert
            setTimeout(() => {
                expect(mockProfileService.updateProfile).toHaveBeenCalled();
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalled();
                expect(mockNativePageTransitions.slide).toHaveBeenCalled();
            }, 0);
        });

        it('should return error for update profile', () => {
            userTypeSelectionPage.selectedUserType = ProfileType.TEACHER;
            mockProfileService.updateProfile = jest.fn(() => throwError({error: {}}));
            mockProfileService.updateServerProfile = jest.fn(() => throwError({error: {}}));
            userTypeSelectionPage.updateProfile('sample-page', {});
            setTimeout(() => {
                expect(mockProfileService.updateProfile).toHaveBeenCalled();
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
            }, 0);
        });
    });

    describe('gotoNextPage', () => {
        it('should navigate To Tabs As Guest', () => {
            // arrange
            mockEvents.publish = jest.fn(() => []);
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => true);
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockAppGlobalService.isProfileSettingsCompleted = true;
            mockAppGlobalService.isOnBoardingCompleted = true;
            mockRouter.navigate = jest.fn();
            const navigationExtras: NavigationExtras = { state: { loginMode: 'guest' } };
            // act
            userTypeSelectionPage.gotoNextPage(false);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
            expect(mockCommonUtilService.isAccessibleForNonStudentRole).toHaveBeenCalled();
            expect(mockContainer.removeAllTabs).toHaveBeenCalled();
            expect(mockContainer.addTab).toHaveBeenCalled();
            expect(mockAppGlobalService.isProfileSettingsCompleted).toBeTruthy();
            expect(mockAppGlobalService.isOnBoardingCompleted).toBeTruthy();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs'], navigationExtras);
        });

        it('should update profile if userType is changed', () => {
            // arrange
            mockEvents.publish = jest.fn(() => []);
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => false);
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockAppGlobalService.isProfileSettingsCompleted = true;
            mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = true;
            jest.spyOn(userTypeSelectionPage, 'updateProfile').mockImplementation(() => {
                return;
            });
            userTypeSelectionPage.selectedUserType = ProfileType.STUDENT;
            // act
            userTypeSelectionPage.gotoNextPage(true);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
            expect(mockCommonUtilService.isAccessibleForNonStudentRole).toHaveBeenCalled();
            expect(mockContainer.removeAllTabs).toHaveBeenCalled();
            expect(mockContainer.addTab).toHaveBeenCalled();
            expect(mockAppGlobalService.isProfileSettingsCompleted).toBeTruthy();
            expect(mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE).toBeTruthy();
        });

        it('should navigate to signIn page for admin', () => {
            // arrange
            mockEvents.publish = jest.fn(() => []);
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => false);
            userTypeSelectionPage.selectedUserType = ProfileType.ADMIN;
            mockAppGlobalService.isProfileSettingsCompleted = false;
            mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = true;
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            userTypeSelectionPage.gotoNextPage(false);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
            expect(mockCommonUtilService.isAccessibleForNonStudentRole).toHaveBeenCalled();
            expect(mockAppGlobalService.isProfileSettingsCompleted).toBeFalsy();
            expect(mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE).toBeTruthy();
            expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN]);
        });

        it('should navigate to profile settings page for student', () => {
            // arrange
            mockEvents.publish = jest.fn(() => []);
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => false);
            userTypeSelectionPage.selectedUserType = ProfileType.STUDENT;
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockAppGlobalService.isProfileSettingsCompleted = false;
            mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = true;
            mockNativePageTransitions.slide = jest.fn(() => Promise.resolve({}));
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            userTypeSelectionPage.gotoNextPage();
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
            expect(mockCommonUtilService.isAccessibleForNonStudentRole).toHaveBeenCalled();
            expect(mockContainer.removeAllTabs).toHaveBeenCalled();
            expect(mockContainer.addTab).toHaveBeenCalled();
            expect(mockAppGlobalService.isProfileSettingsCompleted).toBeFalsy();
            expect(mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE).toBeTruthy();
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE_SETTINGS}`],
                { state: { showProfileSettingPage: true } });
            }, 0);
        });

        it('should update profile data', () => {
            // arrange
            mockEvents.publish = jest.fn(() => []);
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => false);
            userTypeSelectionPage.selectedUserType = ProfileType.STUDENT;
            mockContainer.removeAllTabs = jest.fn();
            mockContainer.addTab = jest.fn();
            mockAppGlobalService.isProfileSettingsCompleted = false;
            mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE = false;
            jest.spyOn(userTypeSelectionPage, 'updateProfile').mockImplementation(() => {
                return;
            });
            // act
            userTypeSelectionPage.gotoNextPage(false);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
            expect(mockCommonUtilService.isAccessibleForNonStudentRole).toHaveBeenCalled();
            expect(mockContainer.removeAllTabs).toHaveBeenCalled();
            expect(mockContainer.addTab).toHaveBeenCalled();
            expect(mockAppGlobalService.isProfileSettingsCompleted).toBeFalsy();
            expect(mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE).toBeFalsy();
        });
    });

    describe('continue', () => {
        it('should go to next page if userType is not change', () => {
            // arrange
            userTypeSelectionPage.profile = {
                handle: 'USER',
                profileType: 'sample-type'
            };
            userTypeSelectionPage.selectedUserType = 'sample-type';
            jest.spyOn(userTypeSelectionPage, 'gotoNextPage').mockImplementation(() => {
                return;
            });
            // act
            userTypeSelectionPage.continue();
            // assert
            expect(userTypeSelectionPage.profile.profileType).toEqual(userTypeSelectionPage.selectedUserType);
        });

        it('should go to next page if userType is changed', () => {
            // arrange
            userTypeSelectionPage.profile = {
                handle: 'USER',
                profileType: 'sample-type'
            };
            userTypeSelectionPage.selectedUserType = 'sample-user-type';
            jest.spyOn(userTypeSelectionPage, 'gotoNextPage').mockImplementation(() => {
                return;
            });
            // act
            userTypeSelectionPage.continue();
            // assert
            expect(userTypeSelectionPage.profile.profileType).toBeTruthy();
        });

        it('should set profile if profile is undefined and uid is not null', () => {
            // arrange
            userTypeSelectionPage.profile = {
                handle: undefined,
                profileType: 'sample-type',
                uid: 'sample-uid'
            };
            userTypeSelectionPage.selectedUserType = 'sample-user-type';
            mockProfileService.updateProfile = jest.fn(() => of({}));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                uid: 'sample-uid',
                handle: 'USER'
            }));
            mockEvents.publish = jest.fn(() => []);
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            jest.spyOn(userTypeSelectionPage, 'gotoNextPage').mockImplementation(() => {
                return;
            });
            // act
            userTypeSelectionPage.continue();
            // assert
            setTimeout(() => {
                expect(mockProfileService.updateProfile).toHaveBeenCalledWith({
                    handle: 'Guest1',
                    profileType: 'sample-user-type',
                    source: 'local',
                    uid: 'sample-uid'
                });
                expect(mockProfileService.setActiveSessionForProfile).toHaveBeenCalledWith(userTypeSelectionPage.profile.uid);
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith(
                    PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN,
                    userTypeSelectionPage.profile.uid
                );
                done();
            }, 0);
        });

        it('should set profile if profile is undefined and uid is null', () => {
            // arrange
            userTypeSelectionPage.profile = {
                handle: undefined,
                profileType: 'sample-type',
                uid: 'sample-uid'
            };
            userTypeSelectionPage.selectedUserType = 'sample-user-type';
            mockProfileService.updateProfile = jest.fn(() => of({}));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                uid: 'null',
                handle: 'USER'
            }));
            mockEvents.publish = jest.fn(() => []);
            jest.spyOn(userTypeSelectionPage, 'gotoNextPage').mockImplementation(() => {
                return;
            });
            // act
            userTypeSelectionPage.continue();
            // assert
            setTimeout(() => {
                expect(mockProfileService.updateProfile).toHaveBeenCalledWith({
                    handle: 'Guest1',
                    profileType: 'sample-user-type',
                    source: 'local',
                    uid: 'sample-uid'
                });
                expect(mockProfileService.setActiveSessionForProfile).toHaveBeenCalledWith('sample-uid');
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
                done();
            }, 0);
        });

        it('should return null if profile is undefined for catch part', () => {
            // arrange
            userTypeSelectionPage.profile = {
                handle: undefined,
                profileType: 'sample-type',
                uid: 'sample-uid'
            };
            userTypeSelectionPage.selectedUserType = 'sample-user-type';
            mockProfileService.updateProfile = jest.fn(() => of({}));
            mockProfileService.setActiveSessionForProfile = jest.fn(() => of(true));
            mockProfileService.getActiveSessionProfile = jest.fn(() => throwError({
                error: {}
            }));
            // act
            userTypeSelectionPage.continue();
            // assert
            setTimeout(() => {
                expect(mockProfileService.updateProfile).toHaveBeenCalledWith({
                    handle: 'Guest1',
                    profileType: 'sample-user-type',
                    source: 'local',
                    uid: 'sample-uid'
                });
                expect(mockProfileService.setActiveSessionForProfile).toHaveBeenCalledWith('sample-uid');
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
            }, 0);
        });
    });

    it('should generate interact telemetry', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockAppGlobalService.isOnBoardingCompleted = false;
        const values = new Map();
        values['userType'] = ('sample-user').toUpperCase();
        const correlationlist: Array<CorrelationData> = [];
        correlationlist.push({ id: 'sample-user', type: CorReleationDataType.USERTYPE });
        // act
        userTypeSelectionPage.generateInteractEvent('sample-user');
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
            InteractType.TOUCH,
            InteractSubtype.USER_TYPE_SELECTED,
            Environment.ONBOARDING,
            PageId.USER_TYPE_SELECTION,
            undefined,
            values
        );
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
            InteractType.SELECT_CONTINUE, '',
            Environment.ONBOARDING,
            PageId.USER_TYPE,
            undefined,
            values,
            undefined,
            correlationlist
        );
    });

    it('should generate interact telemetry', () => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockAppGlobalService.isOnBoardingCompleted = false;
        const values = new Map();
        values['userType'] = ('sample-user').toUpperCase();
        const correlationlist: Array<CorrelationData> = [];
        correlationlist.push({ id: 'sample-user', type: CorReleationDataType.USERTYPE });
        mockAppGlobalService.isOnBoardingCompleted = true;
        // act
        userTypeSelectionPage.generateInteractEvent('sample-user');
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
            InteractType.TOUCH,
            InteractSubtype.USER_TYPE_SELECTED,
            Environment.HOME,
            PageId.USER_TYPE_SELECTION,
            undefined,
            values
        );
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
            InteractType.SELECT_CONTINUE, '',
            Environment.HOME,
            PageId.USER_TYPE,
            undefined,
            values,
            undefined,
            correlationlist
        );
    });

    it('should navigate to profile page', () => {
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        userTypeSelectionPage.navigateToProfilePage();
        expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should return response for onSubmitAttempt', () => {
        window.setTimeout = jest.fn((fn) => {
            fn()
        }, 50) as any;
        jest.spyOn(userTypeSelectionPage, 'continue').mockImplementation();
        userTypeSelectionPage.onSubmitAttempt();
    });

    it('should unsubscribe back button', () => {
        userTypeSelectionPage.backButtonFunc = {
            unsubscribe: jest.fn()
        } as any;
        userTypeSelectionPage.ngOnDestroy();
        expect(userTypeSelectionPage.backButtonFunc.unsubscribe).toHaveBeenCalled();
    });

    it('should not unsubscribe back button', () => {
        userTypeSelectionPage.backButtonFunc = undefined;
        userTypeSelectionPage.ngOnDestroy();
        expect(userTypeSelectionPage.backButtonFunc).toBeUndefined();
    });
});
