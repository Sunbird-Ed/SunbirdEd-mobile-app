import { AppGlobalService } from './app-global-service.service';
import { ProfileService, AuthService, FrameworkService, SharedPreferences, ProfileType } from '@project-sunbird/sunbird-sdk';
import { PopoverController } from '@ionic/angular';
import { Events } from '../util/events';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { UtilityService } from './utility-service';
import { of, throwError } from 'rxjs';
import { PreferenceKey } from '../app/app.constant';
import { InteractSubtype, Environment, PageId, InteractType, ID } from './telemetry-constants';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { mockFrameworkData } from './app-global-service.service.spec.data';
import { UpgradePopoverComponent } from '../app/components/popups';
import { YearOfBirthPopupComponent } from '../app/components/popups/year-of-birth-popup/year-of-birth-popup.component';
import { NewExperiencePopupComponent } from '../app/components/popups/new-experience-popup/new-experience-popup.component';
import { JoyfulThemePopupComponent } from '../app/components/popups/joyful-theme-popup/joyful-theme-popup.component';

describe('AppGlobalService', () => {
    let appGlobalService: AppGlobalService;
    const profile = { syllabus: 'tn' } as any;
    const mockProfile: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn(() => of(profile))
    };
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => of())
    };
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockEvent: Partial<Events> = {
        subscribe: jest.fn(() => of({skipSession: false})),
        publish: jest.fn(),
        unsubscribe: jest.fn()
    };
    const mockPopoverCtrl: Partial<PopoverController> = {};
    mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onDidDismiss: jest.fn(() => Promise.resolve({ data: { canDelete: true } }))
    } as any)));
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of(undefined)),
        putString: jest.fn(() => of(undefined))
    };
    const mockUtilityService: Partial<UtilityService> = {
        getBuildConfigValue: jest.fn(() => Promise.resolve('org.sunbird.app'))
    };
    const mockAppVersion: Partial<AppVersion> = {};
    window.console.error = jest.fn();
    beforeAll(() => {
        appGlobalService = new AppGlobalService(
            mockProfile as ProfileService,
            mockAuthService as AuthService,
            mockFrameworkService as FrameworkService,
            mockPreferences as SharedPreferences,
            mockEvent as Events,
            mockPopoverCtrl as PopoverController,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockUtilityService as UtilityService,
            mockAppVersion as AppVersion,
            mockPopoverCtrl as PopoverController
        );
    });

    it('should be create a instance of appGlobalService', () => {
        expect(appGlobalService).toBeTruthy();
    });

    describe('getIsPermissionAsked()', () => {
        it('should return value saved in preference', (done) => {
            // arrange
            mockPreferences.getString = jest.fn(() => of('{\"isCameraAsked\":true,\"isStorageAsked\":false,\"isRecordAudioAsked\":false}'));
            // act
            // assert
            appGlobalService.getIsPermissionAsked('isCameraAsked').subscribe((response) => {
                expect(response).toBeTruthy();
                done();
            });
        });
    });

    it('should checked user iis loggedIn or Not', () => {
        // arrange
        appGlobalService.isGuestUser = false;
        // assert
        appGlobalService.isUserLoggedIn();
        // act
        expect(appGlobalService.isGuestUser).toBeFalsy();
    });

    it('should return GuestUserType', () => {
        // arrange
        appGlobalService.guestProfileType = ProfileType.TEACHER;
        // act
        appGlobalService.getGuestUserType();
        // assert
        expect(appGlobalService.guestProfileType).toBe('teacher');
    });

    it('should set to user permission for access device internal things', () => {
        // arrange
        const key = 'media';
        const value = true;
        mockPreferences.putString = jest.fn(() => of(undefined));
        // act
        appGlobalService.setIsPermissionAsked(key, value);
        // assert
        expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.APP_PERMISSION_ASKED);
        expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.APP_PERMISSION_ASKED, expect.any(String));
    });

    it('should set to user permission for access device internal things for else part', () => {
        // arrange
        const key = 'media';
        const value = true;
        const data = mockPreferences.getString = jest.fn(() => of(''));
        mockPreferences.putString = jest.fn(() => of(undefined));
        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return data;
        });
        // act
        appGlobalService.setIsPermissionAsked(key, value);
        // assert
        expect(mockPreferences.getString).toHaveBeenCalledWith(PreferenceKey.APP_PERMISSION_ASKED);
        // expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.APP_PERMISSION_ASKED, expect.any(String));
    });

    it('should be limitedShare QuizContent flow', () => {
        // arrange
        appGlobalService.limitedShareQuizContent = true;
        // act
        // assert
        expect(appGlobalService.limitedShareQuizContent).toBeTruthy();
    });

    it('should be SignInOnboarding Completed flow', () => {
        // arrange
        appGlobalService.isSignInOnboardingCompleted = true;
        // act
        // assert
        expect(appGlobalService.isSignInOnboardingCompleted).toBeTruthy();
    });

    it('should join traning onboarding flow', () => {
        // arrange
        appGlobalService.isJoinTraningOnboardingFlow = true;
        // act
        // assert
        expect(appGlobalService.isJoinTraningOnboardingFlow).toBeTruthy();
    });

    it('should reset limitedShareQuizContent Context', () => {
        // arrange
        // act
        appGlobalService.resetSavedQuizContent();
        // assert
        expect(appGlobalService.limitedShareQuizContent).toBeNull();
    });

    it('should set the signin Onboarding loader', () => {
        // arrange
        appGlobalService.signinOnboardingLoader = {
            dismiss: jest.fn((fn) => fn())
        };
        // act
        // assert
        expect(appGlobalService.signinOnboardingLoader).toBeDefined();
    });

    it('should dismiss the  signin Onboarding loader', (done) => {
        // arrange
        appGlobalService.signinOnboardingLoader = {
            dismiss: jest.fn(() => Promise.resolve())
        };
        // act
        appGlobalService.closeSigninOnboardingLoader();
        // assert
        expect(appGlobalService.signinOnboardingLoader.dismiss).toHaveBeenCalled();

        setTimeout(() => {
            expect(appGlobalService.signinOnboardingLoader).toBeNull();
            done();
        }, 1);
    });


    it('should handle else case if no signin Onboarding loader', (done) => {
        // arrange
        appGlobalService.signinOnboardingLoader = undefined;
        // act
        appGlobalService.closeSigninOnboardingLoader();
        // assert
        setTimeout(() => {
            // expect(appGlobalService.signinOnboardingLoader).toBeNull();
            done();
        }, 1);
    });

    describe('getPageIdForTelemetry()', () => {
        it('should return expected pageId', () => {
            // arrange
            appGlobalService.currentPageId = PageId.LIBRARY;
            // act
            // assert
            expect(appGlobalService.getPageIdForTelemetry()).toEqual(PageId.LIBRARY);

            // arrange
            appGlobalService.currentPageId = PageId.COURSES;
            // act
            // assert
            expect(appGlobalService.getPageIdForTelemetry()).toEqual(PageId.COURSES);

            // arrange
            appGlobalService.currentPageId = PageId.DOWNLOADS;
            // act
            // assert
            expect(appGlobalService.getPageIdForTelemetry()).toEqual(PageId.DOWNLOADS);

            // arrange
            appGlobalService.currentPageId = PageId.PROFILE;
            // act
            // assert
            expect(appGlobalService.getPageIdForTelemetry()).toEqual(PageId.PROFILE);

            // arrange
            appGlobalService.currentPageId = PageId.CONTENT_DETAIL;
            // act
            // assert
            expect(appGlobalService.getPageIdForTelemetry()).toEqual(PageId.LIBRARY);

            // arrange
            appGlobalService.currentPageId = '';
            // act
            // assert
            expect(appGlobalService.getPageIdForTelemetry()).toEqual(PageId.LIBRARY);
        });
    });

    describe('setAverageTime()', () => {
        it('should set averageTime', () => {
            // arrange
            // act
            appGlobalService.setAverageTime('10');
            // assert
            expect(appGlobalService.getAverageTime()).toEqual('10');
        });
    });

    describe('setAverageScore()', () => {
        it('should set AverageScore', () => {
            // arrange
            // act
            appGlobalService.setAverageScore('91.5');
            // assert
            expect(appGlobalService.getAverageScore()).toEqual('91.5');
        });
    });

    describe('getProfileSettingsStatus()', () => {
        it('should return true if all profile attributes are available', (done) => {
            // arrange
            appGlobalService.guestUserProfile = {
                syllabus: ['AP'],
                board: ['AP'],
                grade: ['class1'],
                medium: ['English']
            } as any;
            appGlobalService.isGuestUser = true;
            // act
            // assert
            appGlobalService.getProfileSettingsStatus().then((response) => {
                expect(response).toBeTruthy();
                done();
            });
        });

        it('should return false if some profile attributes are missing', (done) => {
            // arrange
            appGlobalService.guestUserProfile = {
                syllabus: ['AP'],
                board: ['AP'],
                medium: ['English']
            } as any;
            appGlobalService.isGuestUser = true;
            // act
            // assert
            appGlobalService.getProfileSettingsStatus().then((response) => {
                expect(response).toBeFalsy();
                done();
            });
        });

        it('should get current profile and set profile details', (done) => {
            // arrange
            appGlobalService.guestUserProfile = {
                syllabus: ['AP'],
                board: ['AP'],
                grade: ['class1'],
                medium: ['English']
            } as any;
            appGlobalService.isGuestUser = true;
            jest.spyOn(appGlobalService, 'getCurrentUser').mockReturnValue(appGlobalService.guestUserProfile)
            // act
            appGlobalService.getProfileSettingsStatus(appGlobalService.guestUserProfile).then((response) => {
                // assert
                expect(response).toBeTruthy();
                done();
            });
        });
    });

    describe('setBoardMediumGrade()', () => {
        it('should set BoardMediumGrade', () => {
            // arrange
            // act
            appGlobalService.setSelectedBoardMediumGrade('Board: AP, Grade: Class1, Medium: English');
            // assert
            expect(appGlobalService.getSelectedBoardMediumGrade()).toEqual('Board: AP, Grade: Class1, Medium: English');
        });
    });

    describe('ngOnDestroy()', () => {
        it('should unsubscribe events on ngOnDestroy', () => {
            // arrange
            // act
            appGlobalService.ngOnDestroy();
            // assert
            expect(mockEvent.unsubscribe).toHaveBeenCalledWith(AppGlobalService.USER_INFO_UPDATED);
            expect(mockEvent.unsubscribe).toHaveBeenCalledWith('refresh:profile');

        });
    });

    describe('getIsPermissionAsked()', () => {
        it('should return false if none of the preference value is saved in preference', (done) => {
            // arrange
            mockPreferences.getString = jest.fn(() => of(undefined));
            appGlobalService.isPermissionAsked = {
                isCameraAsked: false,
                isStorageAsked: false,
                isRecordAudioAsked: false,
            };
            // act
            // assert
            appGlobalService.getIsPermissionAsked('isCameraAsked').subscribe((response) => {
                expect(response).toBeFalsy();
                expect(mockPreferences.putString).toHaveBeenCalledWith(
                    PreferenceKey.APP_PERMISSION_ASKED,
                    JSON.stringify(appGlobalService.isPermissionAsked));
                done();
            });
        });
    });

    describe('generateConfigInteractEvent()', () => {
        it('should generate telemetry with LIBRARY page config for TEACHER profile type', () => {
            // arrange
            appGlobalService.guestProfileType = ProfileType.TEACHER;
            appGlobalService.isGuestUser = true;
            const paramsMap = new Map();
            paramsMap['isProfileSettingsCompleted'] = true;
            paramsMap['isSignInCardConfigEnabled'] = false;
            // act
            appGlobalService.generateConfigInteractEvent(PageId.LIBRARY, true);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.INITIAL_CONFIG,
                Environment.HOME,
                PageId.LIBRARY,
                undefined,
                paramsMap);
        });

        it('should generate telemetry with COURSE page config for TEACHER profile type', () => {
            // arrange
            appGlobalService.guestProfileType = ProfileType.TEACHER;
            appGlobalService.isGuestUser = true;
            const paramsMap = new Map();
            paramsMap['isProfileSettingsCompleted'] = true;
            paramsMap['isSignInCardConfigEnabled'] = false;
            // act
            appGlobalService.generateConfigInteractEvent(PageId.COURSES, true);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.INITIAL_CONFIG,
                Environment.HOME,
                PageId.LIBRARY,
                undefined,
                paramsMap);
        });

        it('should generate telemetry with GUEST_PROFILE page config for TEACHER profile type', () => {
            // arrange
            appGlobalService.guestProfileType = ProfileType.TEACHER;
            appGlobalService.isGuestUser = true;
            const paramsMap = new Map();
            paramsMap['isProfileSettingsCompleted'] = true;
            paramsMap['isSignInCardConfigEnabled'] = false;
            // act
            appGlobalService.generateConfigInteractEvent(PageId.GUEST_PROFILE, true);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.INITIAL_CONFIG,
                Environment.HOME,
                PageId.LIBRARY,
                undefined,
                paramsMap);
        });

        it('should generate telemetry with GUEST_PROFILE page config for STUDENT profile type', () => {
            // arrange
            appGlobalService.guestProfileType = ProfileType.STUDENT;
            appGlobalService.isGuestUser = true;
            const paramsMap = new Map();
            paramsMap['isProfileSettingsCompleted'] = true;
            paramsMap['isSignInCardConfigEnabled'] = false;
            // act
            appGlobalService.generateConfigInteractEvent(PageId.LIBRARY, true);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.INITIAL_CONFIG,
                Environment.HOME,
                PageId.LIBRARY,
                undefined,
                paramsMap);
        });

        it('should generate telemetry with GUEST_PROFILE page config for STUDENT profile type', () => {
            // arrange
            appGlobalService.guestProfileType = ProfileType.STUDENT;
            appGlobalService.isGuestUser = true;
            const paramsMap = new Map();
            paramsMap['isProfileSettingsCompleted'] = true;
            paramsMap['isSignInCardConfigEnabled'] = false;
            // act
            appGlobalService.generateConfigInteractEvent(PageId.GUEST_PROFILE, true);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.INITIAL_CONFIG,
                Environment.HOME,
                PageId.LIBRARY,
                undefined,
                paramsMap);
        });

        it('should generate telemetry with GUEST_PROFILE page config for STUDENT profile type', () => {
            // arrange
            appGlobalService.guestProfileType = ProfileType.STUDENT;
            appGlobalService.isGuestUser = true;
            const paramsMap = new Map();
            paramsMap['isProfileSettingsCompleted'] = true;
            paramsMap['isSignInCardConfigEnabled'] = false;
            // act
            appGlobalService.generateConfigInteractEvent(PageId.PROFILE, true);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.OTHER,
                InteractSubtype.INITIAL_CONFIG,
                Environment.HOME,
                PageId.LIBRARY,
                undefined,
                paramsMap);
        });

        it('should handle else if isguestuser is false', () => {
            // arrange
            appGlobalService.isGuestUser = false;
            // act
            appGlobalService.generateConfigInteractEvent('', false);
        })
    });

    describe('generateAttributeChangeTelemetry()', () => {
        it('should generate attribute change telemetry with given env', () => {
            // arrange
            appGlobalService.TRACK_USER_TELEMETRY = true;
            const values = new Map();
            values['oldValue'] = ['Class 1'];
            values['newValue'] = ['Class 1', 'Class 2'];
            // act
            appGlobalService.generateAttributeChangeTelemetry(['Class 1'], ['Class 1', 'Class 2'], PageId.LIBRARY, Environment.HOME);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.PROFILE_ATTRIBUTE_CHANGED,
                Environment.HOME,
                PageId.LIBRARY,
                undefined,
                values);
        });

        it('should generate attribute change telemetry when env is not given', () => {
            // arrange
            appGlobalService.TRACK_USER_TELEMETRY = true;
            const values = new Map();
            values['oldValue'] = ['Class 1'];
            values['newValue'] = ['Class 1', 'Class 2'];
            // act
            appGlobalService.generateAttributeChangeTelemetry(['Class 1'], ['Class 1', 'Class 2'], PageId.LIBRARY);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.PROFILE_ATTRIBUTE_CHANGED,
                Environment.USER,
                PageId.LIBRARY,
                undefined,
                values);
        });
    });

    describe('generateSaveClickedTelemetry()', () => {
        it('should generate save clicked telemetry', () => {
            // arrange
            appGlobalService.TRACK_USER_TELEMETRY = true;
            const values = new Map();
            values['profile'] = profile;
            values['validation'] = 'medium is required';
            // act
            appGlobalService.generateSaveClickedTelemetry(profile, 'medium is required', PageId.LIBRARY, 'medium-clicked');
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                'medium-clicked',
                Environment.USER,
                PageId.LIBRARY,
                undefined,
                values);
        });

        it('should generate save clicked telemetry for else case', () => {
            // arrange
            appGlobalService.TRACK_USER_TELEMETRY = false;
            const values = new Map();
            values['profile'] = profile;
            values['validation'] = 'medium is required';
            // act
            appGlobalService.generateSaveClickedTelemetry(profile, 'medium is required', PageId.LIBRARY, 'medium-clicked');
            // assert
        });

        it('should generate attribute change telemetry when env is not given', () => {
            // arrange
            appGlobalService.TRACK_USER_TELEMETRY = false;
            const values = new Map();
            values['oldValue'] = ['Class 1'];
            values['newValue'] = ['Class 1', 'Class 2'];
            // act
            appGlobalService.generateAttributeChangeTelemetry(['Class 1'], ['Class 1', 'Class 2'], PageId.LIBRARY);
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.PROFILE_ATTRIBUTE_CHANGED,
                Environment.USER,
                PageId.LIBRARY,
                undefined,
                values);
        });
    });

    describe('getSessionData()', () => {
        it('should return the session data', () => {
            // arrange
            appGlobalService.session = { access_token: '', userToken: '', refresh_token: '' };
            // act
            // assert
            expect(appGlobalService.getSessionData()).toEqual({ access_token: '', userToken: '', refresh_token: '' });
        });
    });

    describe('getSelectedUser()', () => {
        it('should return the selectedUser', () => {
            // arrange
            appGlobalService.setSelectedUser('0123456789');
            // act
            // assert
            expect(appGlobalService.getSelectedUser()).toEqual('0123456789');
        });
    });

    describe('getNameForCodeInFramework()', () => {
        it('should return the name of the provided code in the framework', () => {
            // arrange
            appGlobalService['frameworkData'] = {
                gradeLevel: {terms: [{code: 'class1'}]}
            } as any
            // act
            appGlobalService.getNameForCodeInFramework('gradeLevel', 'class1');
            // assert
        });

        it('should return the name handling with no matching terms', () => {
            // arrange
            appGlobalService['frameworkData'] = {
                gradeLevel: {terms: [{code: 'class2'}]}
            } as any
            // act
            appGlobalService.getNameForCodeInFramework('gradeLevel', 'class1');
            // assert
        });

        it('should return the name handling else case if condition false', () => {
            // arrange
            appGlobalService['frameworkData'] = {
            } as any
            // act
            appGlobalService.getNameForCodeInFramework('gradeLevel', 'class1');
            // assert
        });
    });

    describe('setOnBoardingCompleted()', () => {
        it('should set the value to indicate if the onboarding flow is completed', () => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of('SESSION_DATA'));
            mockPreferences.putString = jest.fn(() => of(undefined));
            // act
            appGlobalService.setOnBoardingCompleted().then(() => {
                // assert
                expect(appGlobalService.isOnBoardingCompleted).toEqual(false);
            });
        });

        it('should not set the value to indicate if the onboarding flow is completed if user is not logged in', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(undefined));
            // act
            appGlobalService.setOnBoardingCompleted().then(() => {
                // assert
                done();
            });
        });
    });

    describe('showTutorialWalkthrough()', () => {
        it('should skip showing tutorialScreen screen if "skipCoachScreenForDeeplink" is true', () => {
            // arrange
            appGlobalService.skipCoachScreenForDeeplink = true;
            // act
            appGlobalService.showTutorialScreen().then(() => {
                // assert
                expect(appGlobalService.skipCoachScreenForDeeplink).toEqual(false);
            });
        });

        it('should save the onboarding completed flag if user is not logged in and display coach screen', (done) => {
            // arrange
            appGlobalService.skipCoachScreenForDeeplink = false;
            mockPreferences.getBoolean = jest.fn(() => of(false));
            mockAppVersion.getAppName = jest.fn(() => Promise.resolve('appname'));
            mockPreferences.putBoolean = jest.fn(() => of(undefined));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { continueClicked: false } }))
            } as any)));
            // act
            appGlobalService.showTutorialScreen().then(() => {
                // assert
                setTimeout(() => {
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    done();

                }, 0);
                expect(mockPreferences.putBoolean).toHaveBeenCalledWith(PreferenceKey.COACH_MARK_SEEN, true);
            });
        });

        it('should generate close clicked after user sees the walkthrough screen', (done) => {
            // arrange
            appGlobalService.skipCoachScreenForDeeplink = false;
            mockPreferences.getBoolean = jest.fn(() => of(false));
            mockAppVersion.getAppName = jest.fn(() => Promise.resolve('appname'));
            mockPreferences.putBoolean = jest.fn(() => of(undefined));
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: { continueClicked: true } }))
            } as any)));
            // act
            appGlobalService.showTutorialScreen().then(() => {
                // assert
                setTimeout(() => {
                    expect(mockPopoverCtrl.create).toHaveBeenCalled();
                    done();
                }, 0);
                expect(mockPreferences.putBoolean).toHaveBeenCalledWith(PreferenceKey.COACH_MARK_SEEN, true);
            });
        });

        it('should not show the coach mark screen if it is already shown', (done) => {
            // arrange
            appGlobalService.skipCoachScreenForDeeplink = false;
            mockPreferences.getBoolean = jest.fn(() => of(true));
            // act
            appGlobalService.showTutorialScreen().then(() => {
                // assert
                done();
            });
        });
    });

    describe('getSelectedUser()', () => {
        it('should return the selectedUser', () => {
            // arrange
            appGlobalService.setSelectedUser('0123456789');
            // act
            // assert
            expect(appGlobalService.getSelectedUser()).toEqual('0123456789');
        });
    });

    describe('getSessionData()', () => {
        it('should return the session data', () => {
            // arrange
            appGlobalService.session = { access_token: '', userToken: '', refresh_token: '' };
            // act
            // assert
            expect(appGlobalService.getSessionData()).toEqual({ access_token: '', userToken: '', refresh_token: '' });
        });
    });

    describe('getSelectedUser()', () => {
        it('should return the selectedUser', () => {
            // arrange
            appGlobalService.setSelectedUser('0123456789');
            // act
            // assert
            expect(appGlobalService.getSelectedUser()).toEqual('0123456789');
        });
    });

    describe('EnrolledCourseList()', () => {
        it('should return the name of the provided code in the framework', () => {
            // arrange
            appGlobalService.setEnrolledCourseList([]);
            // act
            // assert
            expect(appGlobalService.getEnrolledCourseList()).toEqual([]);
        });
    });

    describe('CourseFilterConfig()', () => {
        it('should return cached course Filter config', () => {
            // arrange
            appGlobalService.setCourseFilterConfig([]);
            // act
            // assert
            expect(appGlobalService.getCachedCourseFilterConfig()).toEqual([]);
        });
    });

    describe('LibraryFilterConfig()', () => {
        it('should return cached library Filter config', () => {
            // arrange
            appGlobalService.setLibraryFilterConfig([]);
            // act
            // assert
            expect(appGlobalService.getCachedLibraryFilterConfig()).toEqual([]);
        });
    });

    describe('setLocationConfig()', () => {
        it('should return cached location config', () => {
            // arrange
            appGlobalService.setLocationConfig([]);
            // act
            // assert
            expect(appGlobalService.getCachedLocationConfig()).toEqual([]);
        });
    });

    describe('SupportedUrlRegexConfig()', () => {
        it('should return cached location config', () => {
            // arrange
            appGlobalService.setSupportedUrlRegexConfig('sample_regex');
            // act
            // assert
            expect(appGlobalService.getCachedSupportedUrlRegexConfig()).toEqual('sample_regex');
        });
    });

    describe('RootOrganizations()', () => {
        it('should return cached location config', () => {
            // arrange
            appGlobalService.setRootOrganizations([]);
            // act
            // assert
            expect(appGlobalService.getCachedRootOrganizations()).toEqual([]);
        });
    });

    describe('CourseFrameworkId()', () => {
        it('should return cached location config', () => {
            // arrange
            appGlobalService.setCourseFrameworkId('sample_course_frameworkid');
            // act
            // assert
            expect(appGlobalService.getCachedCourseFrameworkId()).toEqual('sample_course_frameworkid');
        });
    });

    describe('getUserId()', () => {
        it('should return user id undefined if cached session id is empty', () => {
            // arrange
            appGlobalService.session = undefined;
            mockAuthService.getSession = jest.fn(() => of({ userToken: '0123456789' } as any));
            // act
            // assert
            expect(appGlobalService.getUserId()).toBeUndefined();
        });

        it('should return user id if cached session id is not empty', () => {
            // arrange
            appGlobalService.session = { userToken: '0123456789' } as any;
            // act
            // assert
            expect(appGlobalService.getUserId()).toEqual('0123456789');
        });
    });

    describe('setpdfPlayerConfiguration()', () => {
        it('should set pdf player Config', () => {
            appGlobalService.setpdfPlayerconfiguration(true);
            expect(appGlobalService.pdfPlayerConfiguratiion).toEqual(true);
        });
    });

    describe('getPdfPlayerConfiguration()', () => {
        it('should return pdf player config', () => {
            appGlobalService.getPdfPlayerConfiguration();
            expect(appGlobalService.pdfPlayerConfiguratiion).toBeTruthy();
        });
    });

    describe('RootOrganizations()', () => {
        it('should return cached location config', () => {
            // arrange
            appGlobalService.setRootOrganizations([]);
            // act
            // assert
            expect(appGlobalService.getCachedRootOrganizations()).toEqual([]);
        });
    });

    describe('getGuestUserInfo()', () => {
        it('should return  profileType STUDENT', (done) => {
            // arrange
            mockPreferences.getString = jest.fn(() => of(ProfileType.STUDENT));
            // act
            // assert
            appGlobalService.getGuestUserInfo().then((response) => {
                expect(appGlobalService.isGuestUser).toBeTruthy();
                expect(response).toEqual(ProfileType.STUDENT);
                done();
            });
        });

        it('should return  profileType TEACHER', (done) => {
            // arrange
            mockPreferences.getString = jest.fn(() => of(ProfileType.TEACHER));
            // act
            // assert
            appGlobalService.getGuestUserInfo().then((response) => {
                expect(appGlobalService.isGuestUser).toBeTruthy();
                expect(response).toEqual(ProfileType.TEACHER);
                done();
            });
        });

        it('should return  profileType OTHER', (done) => {
            // arrange
            mockPreferences.getString = jest.fn(() => of(ProfileType.OTHER));
            // act
            // assert
            appGlobalService.getGuestUserInfo().then((response) => {
                expect(appGlobalService.isGuestUser).toBeTruthy();
                expect(response).toEqual(ProfileType.OTHER);
                done();
            });
        });
        it('should return  profileType ADMIN', (done) => {
            // arrange
            mockPreferences.getString = jest.fn(() => of(ProfileType.ADMIN));
            // act
            // assert
            appGlobalService.getGuestUserInfo().then((response) => {
                expect(appGlobalService.isGuestUser).toBeTruthy();
                expect(response).toEqual(ProfileType.ADMIN);
                done();
            });
        });
        it('should return  profileType PARENT', (done) => {
            // arrange
            mockPreferences.getString = jest.fn(() => of(ProfileType.PARENT));
            // act
            // assert
            appGlobalService.getGuestUserInfo().then((response) => {
                expect(appGlobalService.isGuestUser).toBeTruthy();
                expect(response).toEqual(ProfileType.PARENT);
                done();
            });
        });

        it('should return  profileType new', (done) => {
            // arrange
            mockPreferences.getString = jest.fn(() => of('new'));
            // act
            // assert
            appGlobalService.getGuestUserInfo().then((response) => {
                expect(appGlobalService.isGuestUser).toBeTruthy();
                expect(response).toEqual('parent');
                done();
            });
        });

        it('should handle error scenario', (done) => {
            // arrange
            mockPreferences.getString = jest.fn(() => throwError({}));
            // act
            // assert
            appGlobalService.getGuestUserInfo().catch((error) => {
                expect(error).toBeUndefined();
                done();
            });
        });
    });

    describe('setOnBoardingCompleted()', () => {
        it('should mark onboarding completed', () => {
            // arrange
            // act
            appGlobalService.setOnBoardingCompleted();
            // assert
            expect(appGlobalService.isOnBoardingCompleted).toBeTruthy();
            expect(mockPreferences.putString).toHaveBeenCalledWith(PreferenceKey.IS_ONBOARDING_COMPLETED, 'true');
        });
    });

    describe('readConfig()', () => {
        it('should mark all status to false if utility service API fails', () => {
            // arrange
            appGlobalService.TRACK_USER_TELEMETRY = false;
            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.reject());
            // act
            appGlobalService.readConfig();
            // assert
            expect(appGlobalService.TRACK_USER_TELEMETRY).toBeFalsy();
            expect(appGlobalService.CONTENT_STREAMING_ENABLED).toBeFalsy();
            expect(appGlobalService.DISPLAY_ONBOARDING_CATEGORY_PAGE).toBeFalsy();
            expect(appGlobalService.OPEN_RAPDISCOVERY_ENABLED).toBeFalsy();
            // expect(appGlobalService.SUPPORT_EMAIL).toEqual('');

            mockUtilityService.getBuildConfigValue = jest.fn(() => Promise.resolve('true'));
            appGlobalService.readConfig();
        });
    });

    describe('Constructor()', () => {
        it('should poulate the frameworkdata of the respective profile', () => {
            // arrange
            mockFrameworkService.getFrameworkDetails = jest.fn(() => of(mockFrameworkData));
            mockEvent.subscribe = jest.fn((arg, fn) => {
                return fn('');
            });
            appGlobalService = new AppGlobalService(
                mockProfile as ProfileService,
                mockAuthService as AuthService,
                mockFrameworkService as FrameworkService,
                mockPreferences as SharedPreferences,
                mockEvent as Events,
                mockPopoverCtrl as PopoverController,
                mockTelemetryGeneratorService as TelemetryGeneratorService,
                mockUtilityService as UtilityService,
                mockAppVersion as AppVersion
            );
            // act
            // assert
            expect(appGlobalService['frameworkData']).toEqual([]);
            // expect(mockEvent.publish).toHaveBeenCalledWith(AppGlobalService.PROFILE_OBJ_CHANGED);
        });

        it('should poulate the frameworkdata to empty array of the respective profile', () => {
            // arrange
            mockFrameworkService.getFrameworkDetails = jest.fn(() => throwError({}));
            appGlobalService = new AppGlobalService(
                mockProfile as ProfileService,
                mockAuthService as AuthService,
                mockFrameworkService as FrameworkService,
                mockPreferences as SharedPreferences,
                mockEvent as Events,
                mockPopoverCtrl as PopoverController,
                mockTelemetryGeneratorService as TelemetryGeneratorService,
                mockUtilityService as UtilityService,
                mockAppVersion as AppVersion
            );
            // act
            // assert
            expect(appGlobalService['frameworkData']).toEqual([]);
            expect(mockEvent.publish).toHaveBeenCalledWith(AppGlobalService.PROFILE_OBJ_CHANGED);
        });

        it('should poulate the frameworkdata to empty array of the respective profile', () => {
            // arrange
            mockProfile.getActiveSessionProfile = jest.fn(() => of({}));
            appGlobalService = new AppGlobalService(
                mockProfile as ProfileService,
                mockAuthService as AuthService,
                mockFrameworkService as FrameworkService,
                mockPreferences as SharedPreferences,
                mockEvent as Events,
                mockPopoverCtrl as PopoverController,
                mockTelemetryGeneratorService as TelemetryGeneratorService,
                mockUtilityService as UtilityService,
                mockAppVersion as AppVersion
            );
            // act
            // assert
            expect(appGlobalService['frameworkData']).toEqual([]);
            expect(mockEvent.publish).toHaveBeenCalledWith(AppGlobalService.PROFILE_OBJ_CHANGED);
        });

        it('should poulate the frameworkdata to empty array of the respective profile', () => {
            // arrange
            mockProfile.getActiveSessionProfile = jest.fn(() => throwError({}));
            appGlobalService = new AppGlobalService(
                mockProfile as ProfileService,
                mockAuthService as AuthService,
                mockFrameworkService as FrameworkService,
                mockPreferences as SharedPreferences,
                mockEvent as Events,
                mockPopoverCtrl as PopoverController,
                mockTelemetryGeneratorService as TelemetryGeneratorService,
                mockUtilityService as UtilityService,
                mockAppVersion as AppVersion
            );
            // act
            // assert
            expect(appGlobalService['frameworkData']).toEqual([]);
            expect(mockEvent.publish).toHaveBeenCalledWith(AppGlobalService.PROFILE_OBJ_CHANGED);
        });
    });

    describe('openPopover()', () => {
        it('should show force upgrade popup with shouldDismissAlert as false if type is force', () => {
            // arrange
            // act
            appGlobalService.openPopover({ type: 'force' });
            // assert
            expect(mockPopoverCtrl.create).toHaveBeenCalledWith({
                component: UpgradePopoverComponent,
                componentProps: { upgrade: { type: 'force' } },
                cssClass: 'upgradePopover',
                showBackdrop: true,
                backdropDismiss: false
            });
        });

        it('should show force upgrade popup with shouldDismissAlert as false if type is forced', () => {
            // arrange
            // act
            appGlobalService.openPopover({ type: 'forced' });
            // assert
            expect(mockPopoverCtrl.create).toHaveBeenCalledWith({
                component: UpgradePopoverComponent,
                componentProps: { upgrade: { type: 'forced' } },
                cssClass: 'upgradePopover',
                showBackdrop: true,
                backdropDismiss: false
            });
        });

        it('should show force upgrade popup with shouldDismissAlert as true if type is optional', () => {
            // arrange
            mockPopoverCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({ data: {}}))
            } as any)));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            appGlobalService.openPopover({ type: 'optional', isOnboardingCompleted: true });
            // assert
            expect(mockPopoverCtrl.create).toHaveBeenCalledWith({
                component: UpgradePopoverComponent,
                componentProps: { upgrade: { isOnboardingCompleted: true, type: 'optional' } },
                cssClass: 'upgradePopover',
                showBackdrop: true,
                backdropDismiss: true
            });
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.BACKDROP_DISMISSED,
                    '',
                    Environment.HOME,
                    PageId.UPGRADE_POPUP,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    ID.BACKDROP_CLICKED);
            }, 0);
        });
    });

    describe('isNativePopupVisible', () => {
        it('should return the isNativePopupVisible', () => {
            // arrange
            appGlobalService.isNativePopupVisible = true;

            // act
            // assert
            expect(appGlobalService.isNativePopupVisible).toBeTruthy();

        });
    });

    describe('isNativePopupVisible', () => {
        it('should return the isNativePopupVisible', () => {
            // arrange
            appGlobalService.isNativePopupVisible = true;

            // act
            // assert
            expect(appGlobalService.isNativePopupVisible).toBeTruthy();

        });
    });

    describe('setNativePopupVisible', () => {
        it('should setNativePopupVisible property to false', () => {
            // arrange
            // act
            appGlobalService.setNativePopupVisible(false);
            // assert
            expect(appGlobalService.isNativePopupVisible).toBeFalsy();

        });

        it('should setNativePopupVisible property to true', () => {
            // arrange
            jest.useFakeTimers();
            // act
            appGlobalService.setNativePopupVisible(true, 1);
            // assert
            jest.advanceTimersByTime(20);
            expect(appGlobalService.isNativePopupVisible).toBeTruthy();
            jest.useRealTimers();
            jest.clearAllTimers();

        });

    });

    describe('setisForumEnabled', () => {
        it('should return the isForumEnabled', () => {
            // arrange
            appGlobalService.isForumEnabled = true;
            // act
            // assert
            expect(appGlobalService.isForumEnabled).toBeTruthy();
        });
    });

    it('should be preSignInData  flow', () => {
        // arrange
        appGlobalService.preSignInData = true;
        // act
        // assert
        expect(appGlobalService.preSignInData).toBeTruthy();
    });

    it('should be generateCourseCompleteTelemetry  flow', () => {
        // arrange
        appGlobalService.generateCourseCompleteTelemetry = true;
        // act
        // assert
        expect(appGlobalService.generateCourseCompleteTelemetry).toBeTruthy();
    });

    it('should be generateCourseUnitCompleteTelemetry  flow', () => {
        // arrange
        appGlobalService.generateCourseUnitCompleteTelemetry = true;
        // act
        // assert
        expect(appGlobalService.generateCourseUnitCompleteTelemetry).toBeTruthy();
    });

    it('should be showCourseCompletePopup  flow', () => {
        // arrange
        appGlobalService.showCourseCompletePopup = true;
        // act
        // assert
        expect(appGlobalService.showCourseCompletePopup).toBeTruthy();
    });

    it('should be formConfig  flow', () => {
        // arrange
        appGlobalService.formConfig = true;
        // act
        // assert
        expect(appGlobalService.formConfig).toBeTruthy();
    });

    it('should be selectedActivityCourseId  flow', () => {
        // arrange
        appGlobalService.selectedActivityCourseId = "true";
        // act
        // assert
        expect(appGlobalService.selectedActivityCourseId).toBeTruthy();
    });

    it('should be redirectUrlAfterLogin  flow', () => {
        // arrange
        appGlobalService.redirectUrlAfterLogin = "true";
        // act
        // assert
        expect(appGlobalService.redirectUrlAfterLogin).toBeTruthy();
    });

    it('should be isDiscoverBackEnabled  flow', () => {
        // arrange
        appGlobalService.isDiscoverBackEnabled = true;
        // act
        // assert
        expect(appGlobalService.isDiscoverBackEnabled).toBeTruthy();
    });

    describe('showJoyfulPopup', () =>{
        it('should skip coach screen deep link to true', () => {
            // arrange
            mockPreferences.getBoolean = jest.fn(() => of(true))
            // act
            appGlobalService.showJoyfulPopup()
            // assert
        })
        it('should skip coach screen deep link to false', () => {
            // arrange
            appGlobalService.skipCoachScreenForDeeplink = true;
            mockPreferences.getBoolean = jest.fn(() => of(false))
            // act
            appGlobalService.showJoyfulPopup()
            // assert
        })
        it('should skip coach screen deep link to false and joyfull display false and create popup', () => {
            // arrange
            mockPreferences.getBoolean = jest.fn(() => of(false))
            // act
            appGlobalService.showJoyfulPopup()
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalledWith({
                    component: JoyfulThemePopupComponent,
                    componentProps: { appLabel: "appLabel" },
                    backdropDismiss: false,
                    showBackdrop: true,
                    cssClass: 'sb-new-theme-popup'
                });
            }, 0);
        })
    })
    describe('showNewTabsSwitchPopup', () =>{
        it('should show new tab switch on popup display false', () => {
            // arrange
            mockPreferences.getString = jest.fn(() => of(false))
            // act
            appGlobalService.showNewTabsSwitchPopup()
            // assert
            setTimeout(() => {
                expect(mockPopoverCtrl.create).toHaveBeenCalledWith({
                    component: NewExperiencePopupComponent,
                    componentProps: { appLabel: "appLabel" },
                    backdropDismiss: false,
                    showBackdrop: true,
                    cssClass: 'sb-switch-new-experience-popup'
                });
            }, 0);
        })
        it('should show new tab switch on popup display true', () => {
            // arrange
            mockPreferences.getString = jest.fn(() => of(true))
            // act
            appGlobalService.showNewTabsSwitchPopup()
            // assert
        })
    })

    describe('getActiveProfileUid', () =>{
        it('should get active profile uid', () => {
            // arrange
            mockProfile.getActiveProfileSession = jest.fn(() => of({uid: "some_id", managedSession: {uid: "some_id"}}))
            // act
            appGlobalService.getActiveProfileUid()
            // assert
        });
        it('should get active profile uid', () => {
            // arrange
            mockProfile.getActiveProfileSession = jest.fn(() => of({uid: "some_id", managedSession: ''}))
            // act
            appGlobalService.getActiveProfileUid()
            // assert
        })
        it('should get active profile uid on error return userid', () => {
            // arrange
            mockProfile.getActiveProfileSession = jest.fn(() => throwError({}))
            // act
            appGlobalService.getActiveProfileUid()
            // assert
        })
    })
    describe('showYearOfBirthPopup', () =>{
        it('should show year of birth popup', () => {
            // arrange
            const userProfile = {};
            // act
            appGlobalService.showYearOfBirthPopup(userProfile)
            // assert
            expect(mockPopoverCtrl.create).toHaveBeenCalledWith({
                component: YearOfBirthPopupComponent,
                componentProps: {   },
                backdropDismiss: false,
                showBackdrop: true,
                cssClass: 'year-of-birth-popup'
            });
        })

        it('should show year of birth popup else case for user details', () => {
            // arrange
            const userProfile = {dob: 1997, managedBy: 'some'};
            // act
            appGlobalService.showYearOfBirthPopup(userProfile)
            // assert
        })
    })
    describe('setAccessibilityFocus', () =>{
        it('should set accssibility focus and set null if no ele focus', () => {
            // arrange
            const id = 123
            window.setTimeout = jest.fn((fn) => fn(
                document.getElementById = jest.fn(() => null)
            ))
            // act
            appGlobalService.setAccessibilityFocus(id)
            // assert
            setTimeout(() => {
                
            }, 0);
        })

        it('should set accssibility focus and handle ele focus', () => {
            // arrange
            const id = 123
            window.setTimeout = jest.fn((fn) => fn(
                document.getElementById = jest.fn(() => ({focus: jest.fn()})) as any
            )) as any;
            // act
            appGlobalService.setAccessibilityFocus(id)
            // assert
            setTimeout(() => {
                

            }, 0);
        })
    })

    describe('setFramewokCategory', () => {
        it('setFramewokCategory ', () => {
            // arrange
            // act
            appGlobalService.setFramewokCategory({});
            // assert
            expect(appGlobalService.getCachedFrameworkCategory()).toEqual({});
        })
    })
});