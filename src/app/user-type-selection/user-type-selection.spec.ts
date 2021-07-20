import { UserTypeSelectionPage } from './user-type-selection';
import {
    ProfileService,
    SharedPreferences
} from 'sunbird-sdk';
import { Platform } from '@ionic/angular';
import { Events } from '@app/util/events';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {
    AppGlobalService,
    TelemetryGeneratorService,
    CommonUtilService,
    ContainerService,
    AppHeaderService,
    AuditProps,
    AuditType
} from '../../services';
import { of, throwError } from 'rxjs';
import { NgZone } from '@angular/core';
import { HasNotSelectedFrameworkGuard } from '@app/guards/has-not-selected-framework.guard';
import { NativePageTransitions } from '@ionic-native/native-page-transitions/ngx';
import {
    CorReleationDataType, Environment, InteractSubtype, InteractType, LoginHandlerService, PageId,
    SplashScreenService
} from '../../services';
import { AuditState, CorrelationData, ProfileType } from '@project-sunbird/sunbird-sdk';
import { PreferenceKey, RouterLinks } from '../app.constant';
import { ProfileHandler } from '../../services/profile-handler';
import { TncUpdateHandlerService } from '../../services/handlers/tnc-update-handler.service';

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
        updateProfile: jest.fn(() => of({}))
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
            mockLoginHandlerService as LoginHandlerService
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
            mockNgZone.run = jest.fn((fn) => fn());
            jest.advanceTimersByTime(200);
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            userTypeSelectionPage.selectUserTypeCard('USER_TYPE_1', ProfileType.TEACHER);
            // assert
            expect(userTypeSelectionPage.selectedUserType).toEqual(ProfileType.TEACHER);
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(1, 'USER_TYPE_1');
            expect(mockCommonUtilService.translateMessage).toHaveBeenNthCalledWith(2, 'CONTINUE_AS_ROLE', undefined);
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER);
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(1,
                InteractType.TOUCH,
                InteractSubtype.USER_TYPE_SELECTED,
                Environment.ONBOARDING,
                PageId.USER_TYPE_SELECTION,
                undefined,
                { userType: 'TEACHER' }
            );

            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenNthCalledWith(2,
                InteractType.SELECT_USERTYPE, '',
                Environment.ONBOARDING,
                PageId.USER_TYPE,
                undefined,
                undefined,
                undefined,
                [{ id: 'teacher', type: CorReleationDataType.USERTYPE }]
            );
            jest.useRealTimers();
            jest.clearAllTimers();
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

    describe('ionViewWillEnter', () => {
        it('should initialized all user-type', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockProfileHandler.getSupportedUserTypes = jest.fn(() => Promise.resolve([]));
            (mockRouter as any).url = `/${RouterLinks.USER_TYPE_SELECTION}`;
            jest.useFakeTimers();
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
            jest.advanceTimersByTime(450);
            jest.runAllTimers();
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
            // act
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
                done();
            });
            // assert
            jest.useRealTimers();
            jest.clearAllTimers();
        });

        it('should set user for logged-in user', (done) => {
            // arrange
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
            jest.spyOn(userTypeSelectionPage, 'handleBackButton').mockImplementation(() => {
                return;
            });
            userTypeSelectionPage.backButtonFunc = {
                unsubscribe: jest.fn()
            } as any;
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
                done();
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
        it('should return birthday popup', (done) => {
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
            mockRouter.navigate = jest.fn(() => Promise.resolve(true));
            // act
            userTypeSelectionPage.navigateToTabsAsLogInUser();
            // assert
            setTimeout(() => {
                expect(mockContainer.removeAllTabs).toHaveBeenCalled();
                expect(mockContainer.addTab).toHaveBeenCalled();
                expect(mockTncUpdateHandlerService.isSSOUser).toHaveBeenCalled();
                expect(mockAppGlobalService.showYearOfBirthPopup).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.TABS]);
                done();
            }, 0);
        });

        it('should navigate to location page', (done) => {
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
                  isShowBackButton: false
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
                done();
            }, 0);
        });

        it('should navigate to category edit page', (done) => {
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
                done();
            }, 0);
        });
    });

    describe('updateProfile', () => {
        it('should navigate to tabs as guest', (done) => {
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
                expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs'], navigationExtras);
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should navigate To Tabs As LogInUser', (done) => {
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
                done();
            }, 0);
        });

        it('should navigate To signIn page', (done) => {
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
            userTypeSelectionPage.updateProfile('sample-page', {});
            // assert
            setTimeout(() => {
                expect(mockProfileService.updateProfile).toHaveBeenCalled();
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalledWith([RouterLinks.SIGN_IN]);
                done();
            }, 0);
        });

        it('should navigate To ProfileSettingsPage', (done) => {
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
                done();
            }, 0);
        });

        it('should return error for update profile', (done) => {
            userTypeSelectionPage.selectedUserType = ProfileType.TEACHER;
            mockProfileService.updateProfile = jest.fn(() => throwError({error: {}}));
            mockProfileService.updateServerProfile = jest.fn(() => throwError({error: {}}));
            userTypeSelectionPage.updateProfile('sample-page', {});
            setTimeout(() => {
                expect(mockProfileService.updateProfile).toHaveBeenCalled();
                expect(mockProfileService.updateServerProfile).toHaveBeenCalled();
                done();
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
            userTypeSelectionPage.gotoNextPage(false);
            // assert
            expect(mockEvents.publish).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
            expect(mockCommonUtilService.isAccessibleForNonStudentRole).toHaveBeenCalled();
            expect(mockContainer.removeAllTabs).toHaveBeenCalled();
            expect(mockContainer.addTab).toHaveBeenCalled();
            expect(mockAppGlobalService.isProfileSettingsCompleted).toBeFalsy();
            expect(mockAppGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE).toBeTruthy();
            expect(mockRouter.navigate).toHaveBeenCalledWith([`/${RouterLinks.PROFILE_SETTINGS}`],
            { state: { showProfileSettingPage: true } });
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

        it('should set profile if profile is undefined and uid is not null', (done) => {
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
            mockTelemetryGeneratorService.generateAuditTelemetry = jest.fn();
            const correlationlist: Array<CorrelationData> = [{ id: PageId.USER_TYPE, type: CorReleationDataType.FROM_PAGE }];
            correlationlist.push({ id: 'sample-user-type', type: CorReleationDataType.USERTYPE });
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
                expect(mockTelemetryGeneratorService.generateAuditTelemetry).toHaveBeenCalledWith(
                    Environment.ONBOARDING,
                    AuditState.AUDIT_UPDATED,
                    [AuditProps.PROFILE_TYPE],
                    AuditType.SELECT_USERTYPE,
                    undefined,
                    undefined,
                    undefined,
                    correlationlist
                );
                done();
            }, 0);
        });

        it('should set profile if profile is undefined and uid is null', (done) => {
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
            mockTelemetryGeneratorService.generateAuditTelemetry = jest.fn();
            const correlationlist: Array<CorrelationData> = [{ id: PageId.USER_TYPE, type: CorReleationDataType.FROM_PAGE }];
            correlationlist.push({ id: 'sample-user-type', type: CorReleationDataType.USERTYPE });
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
                expect(mockTelemetryGeneratorService.generateAuditTelemetry).toHaveBeenCalledWith(
                    Environment.ONBOARDING,
                    AuditState.AUDIT_UPDATED,
                    [AuditProps.PROFILE_TYPE],
                    AuditType.SELECT_USERTYPE,
                    undefined,
                    undefined,
                    undefined,
                    correlationlist
                );
                done();
            }, 0);
        });

        it('should return null if profile is undefined for catch part', (done) => {
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
                done();
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

    it('should navigate to profile page', () => {
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        userTypeSelectionPage.navigateToProfilePage();
        expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should return response for onSubmitAttempt', (done) => {
        userTypeSelectionPage.onSubmitAttempt();
        jest.spyOn(userTypeSelectionPage, 'continue').mockImplementation();
        setTimeout(() => {
            done();
        }, 50);
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
