import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Environment, ID, InteractSubtype, InteractType, PageId, ImpressionType, ImpressionSubtype } from './telemetry-constants';
import { Events, PopoverController } from '@ionic/angular';
import { GenericAppConfig, PreferenceKey, EventTopics } from '../app/app.constant';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import {
    AuthService, Course, Framework, FrameworkCategoryCodesGroup, FrameworkDetailsRequest, FrameworkService,
    OAuthSession, Profile, ProfileService, ProfileType, SharedPreferences, ProfileSession
} from 'sunbird-sdk';
import { UtilityService } from './utility-service';
import { ProfileConstants } from '../app/app.constant';
import { Observable, Observer } from 'rxjs';
import { PermissionAsked } from './android-permissions/android-permission';
import { UpgradePopoverComponent } from '@app/app/components/popups';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { EventParams } from '@app/app/components/sign-in-card/event-params.interface';
import { SbTutorialPopupComponent } from '@app/app/components/popups/sb-tutorial-popup/sb-tutorial-popup.component';
import { animationGrowInTopRight } from '@app/app/animations/animation-grow-in-top-right';
import { animationShrinkOutTopRight } from '@app/app/animations/animation-shrink-out-top-right';

@Injectable({
    providedIn: 'root'
})
export class AppGlobalService implements OnDestroy {
    public static readonly USER_INFO_UPDATED = 'user-profile-changed';
    public static readonly PROFILE_OBJ_CHANGED = 'app-global:profile-obj-changed';
    public static isPlayerLaunched = false;

    session: OAuthSession;

    /**
     * This property stores the courses enrolled by a user
     */
    courseList: Array<Course>;

    /**
     * This property stores the course filter configuration at the app level for a particular app session
     */
    courseFilterConfig: Array<any> = [];

    /**
     * This property stores the library filter configuration at the app level for a particular app session
     */
    libraryFilterConfig: Array<any> = [];

    /**
     * This property stores the location configuration at the app level for a particular app session
     */
    locationConfig: Array<any> = [];

    /**
     * This property stores the Supported Url configuration at the app level for non standard deeplinks
     */
    supportedUrlRegexConfig?: any;

    /**
     * This property stores the organization at the app level for a particular app session
     */
    rootOrganizations: Array<any>;
    courseFrameworkId: string;

    currentPageId: string;
    pdfPlayerConfiguratiion: boolean;

    guestUserProfile: Profile;
    isGuestUser = false;
    guestProfileType: ProfileType;
    isProfileSettingsCompleted: boolean;
    isOnBoardingCompleted = false;
    selectedUser;
    selectedBoardMediumGrade: string;
    isPermissionAsked: PermissionAsked = {
        isCameraAsked: false,
        isStorageAsked: false,
        isRecordAudioAsked: false,
    };
    private _limitedShareQuizContent: any;
    private _isSignInOnboardingCompleted: any;
    private isJoinTraningOnboarding: any;
    private _signinOnboardingLoader: any;
    private _skipCoachScreenForDeeplink = false;
    private _preSignInData: any;
    private _generateCourseCompleteTelemetry = false;
    private _generateCourseUnitCompleteTelemetry = false;
    private _showCourseCompletePopup = false;
    private _formConfig: any;
    private _selectedActivityCourseId: string;
    private _redirectUrlAfterLogin: string;

    constructor(
        @Inject('PROFILE_SERVICE') private profile: ProfileService,
        @Inject('AUTH_SERVICE') public authService: AuthService,
        @Inject('FRAMEWORK_SERVICE') private frameworkService: FrameworkService,
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private event: Events,
        private popoverCtrl: PopoverController,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private utilityService: UtilityService,
        private appVersion: AppVersion
    ) {

        this.initValues();
        this.listenForEvents();
    }
    public averageTime = 0;
    public averageScore = 0;
    private frameworkData = [];
    public DISPLAY_FRAMEWORK_CATEGORIES_IN_PROFILE = false;
    public DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER = false;
    public DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER = false;
    public DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER = false;
    public DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT = false;
    public DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT = false;
    public TRACK_USER_TELEMETRY = false;
    public CONTENT_STREAMING_ENABLED = false;
    public DISPLAY_ONBOARDING_CATEGORY_PAGE = false;
    public OPEN_RAPDISCOVERY_ENABLED = false;
    public SUPPORT_EMAIL = 'support@sunbird.com';

    isUserLoggedIn(): boolean {
        return !this.isGuestUser;
    }

    getGuestUserType(): ProfileType {
        return this.guestProfileType;
    }

    getCurrentUser(): Profile {
        return this.guestUserProfile;
    }

    getSessionData(): any {
        return this.session;
    }

    getSelectedUser() {
        return this.selectedUser;
    }

    setSelectedUser(selectedUser) {
        this.selectedUser = selectedUser;
    }

    getNameForCodeInFramework(category, code) {
        let name;

        if (this.frameworkData[category]
            && this.frameworkData[category].terms
            && this.frameworkData[category].terms.length > 0) {
            const matchingTerm = this.frameworkData[category].terms.find((term) => {
                return term.code === code;
            });

            if (matchingTerm) {
                name = matchingTerm.name;
            }
        }

        return name;
    }


     setpdfPlayerconfiguration(config) {
        this.pdfPlayerConfiguratiion = config;
    }

     getPdfPlayerConfiguration() {
        return this.pdfPlayerConfiguratiion;
    }

    /**
     * This method stores the list of courses enrolled by user, and is updated every time
     * getEnrolledCourses is called.
     */
    setEnrolledCourseList(courseList: Array<any>) {
        this.courseList = courseList;
    }

    /**
     * This method returns the list of enrolled courses
     */
    getEnrolledCourseList(): Array<any> {
        return this.courseList;
    }

    /**
     * This method stores the course filter config, for a particular session of the app
     */
    setCourseFilterConfig(courseFilterConfig: Array<any>) {
        this.courseFilterConfig = courseFilterConfig;
    }

    /**
     * This method returns the course filter config cache, for a particular session of the app
     */
    getCachedCourseFilterConfig(): Array<any> {
        return this.courseFilterConfig;
    }

    /**
     * This method stores the library filter config, for a particular session of the app
     */
    setLibraryFilterConfig(libraryFilterConfig: Array<any>) {
        this.libraryFilterConfig = libraryFilterConfig;
    }

    /**
     * This method returns the library filter config cache, for a particular session of the app
     */
    getCachedLibraryFilterConfig(): Array<any> {
        return this.libraryFilterConfig;
    }

    /**
     * This method stores the location config, for a particular session of the app
     */
    setLocationConfig(locationConfig: Array<any>) {
        this.locationConfig = locationConfig;
    }

    /**
     * This method returns the location config cache, for a particular session of the app
     */
    getCachedLocationConfig(): Array<any> {
        return this.locationConfig;
    }

    /**
     * This method returns the cached Supported url regex config
     */
    getCachedSupportedUrlRegexConfig(): any {
        return this.supportedUrlRegexConfig;
    }

    /**
     * This method stores the Supported url regex config, for a non standard supported url regex
     */
    setSupportedUrlRegexConfig(supportedUrlRegexConfig: any) {
        this.supportedUrlRegexConfig = supportedUrlRegexConfig;
    }

    /**
     * This method stores the rootOrganizations, for a particular session of the app
     */
    setRootOrganizations(rootOrganizations: Array<any>) {
        this.rootOrganizations = rootOrganizations;
    }

    /**
     * This method returns the rootOrganizations cache, for a particular session of the app
     */
    getCachedRootOrganizations(): Array<any> {
        return this.rootOrganizations;
    }

    /**
     * This method stores the courseFrameworkId, for a particular session of the app
     */
    setCourseFrameworkId(courseFrameworkId: string) {
        this.courseFrameworkId = courseFrameworkId;
    }

    /**
     * This method returns the courseFrameworkId cache, for a particular session of the app
     */
    getCachedCourseFrameworkId(): string {
        return this.courseFrameworkId;
    }

    /**
     * @returns UserId or empty string if not available
     * getLoggedinUserId
     */
    getUserId(): string | undefined {
        if (!this.session) {
            this.authService.getSession().toPromise()
                .then((session) => {
                    this.session = session;
                });
        }

        if (this.session) {
            return this.session.userToken;
        }

        return undefined;
    }

    readConfig() {
        this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_FRAMEWORK_CATEGORIES_IN_PROFILE)
            .then(response => {
                this.DISPLAY_FRAMEWORK_CATEGORIES_IN_PROFILE = response === 'true' ? true : false;
            })
            .catch(error => {
                this.DISPLAY_FRAMEWORK_CATEGORIES_IN_PROFILE = false;
            });

        this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER)
            .then(response => {
                this.DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER = response === 'true' ? true : false;
            })
            .catch(error => {
                this.DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER = false;
            });

        this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER)
            .then(response => {
                this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER = response === 'true' ? true : false;
            })
            .catch(error => {
                this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER = false;
            });

        this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER)
            .then(response => {
                this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER = response === 'true' ? true : false;
            })
            .catch(error => {
                this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER = false;
            });

        this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT)
            .then(response => {
                this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT = response === 'true' ? true : false;
            })
            .catch(error => {
                this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT = false;
            });

        this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT)
            .then(response => {
                this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT = response === 'true' ? true : false;
            })
            .catch(error => {
                this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT = false;
            });
        this.utilityService.getBuildConfigValue(GenericAppConfig.TRACK_USER_TELEMETRY)
            .then(response => {
                this.TRACK_USER_TELEMETRY = response === 'true' ? true : false;
            })
            .catch(error => {
                this.TRACK_USER_TELEMETRY = false;
            });
        this.utilityService.getBuildConfigValue(GenericAppConfig.CONTENT_STREAMING_ENABLED)
            .then(response => {
                this.CONTENT_STREAMING_ENABLED = response === 'true' ? true : false;
            })
            .catch(error => {
                this.CONTENT_STREAMING_ENABLED = false;
            });

        this.utilityService.getBuildConfigValue(GenericAppConfig.DISPLAY_ONBOARDING_CATEGORY_PAGE)
            .then(response => {
                this.DISPLAY_ONBOARDING_CATEGORY_PAGE = response === 'true' ? true : false;
            })
            .catch(error => {
                this.DISPLAY_ONBOARDING_CATEGORY_PAGE = false;
            });
        this.utilityService.getBuildConfigValue(GenericAppConfig.OPEN_RAPDISCOVERY_ENABLED)
            .then(response => {
                this.OPEN_RAPDISCOVERY_ENABLED = response === 'true' ? true : false;
            })
            .catch(error => {
                this.OPEN_RAPDISCOVERY_ENABLED = false;
            });
        this.utilityService.getBuildConfigValue(GenericAppConfig.SUPPORT_EMAIL)
            .then(response => {
                this.SUPPORT_EMAIL = response;
            })
            .catch(() => {
                this.SUPPORT_EMAIL = '';
            });
    }

    async setOnBoardingCompleted() {
        const session = await this.authService.getSession().toPromise();
        if (!session) {
            this.isOnBoardingCompleted = true;
            this.preferences.putString(PreferenceKey.IS_ONBOARDING_COMPLETED, 'true').toPromise().then();
        }
    }

    private initValues(eventParams?: EventParams) {
        this.readConfig();
        /* to make sure there are no duplicate calls to getSession and profile setting
         * from login flow only eventParams are received via events
         */
        if (!eventParams || (eventParams && !eventParams.skipSession)) {
            this.authService.getSession().toPromise().then((session) => {
                if (!session) {
                    this.isGuestUser = true;
                    this.session = session;
                    this.getGuestUserInfo();
                } else {
                    this.guestProfileType = undefined;
                    this.isGuestUser = false;
                    this.session = session;
                }
                this.getCurrentUserProfile(eventParams);
            });
        }
        this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise()
            .then((result) => {
                this.isOnBoardingCompleted = (result === 'true') ? true : false;
            });
    }

    private getCurrentUserProfile(eventParams?: EventParams) {
        if (!eventParams || (eventParams && !eventParams.skipProfile)) {
            this.profile.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
                .then((response: Profile) => {
                    this.guestUserProfile = response;
                    if (this.guestUserProfile.syllabus && this.guestUserProfile.syllabus.length > 0) {
                        this.getFrameworkDetails(this.guestUserProfile.syllabus[0])
                            .then((categories) => {
                                categories.forEach(category => {
                                    this.frameworkData[category.code] = category;
                                });

                                this.event.publish(AppGlobalService.PROFILE_OBJ_CHANGED);
                            }).catch(() => {
                                this.frameworkData = [];
                                this.event.publish(AppGlobalService.PROFILE_OBJ_CHANGED);
                            });
                        this.getProfileSettingsStatus();
                    } else {
                        this.frameworkData = [];
                        this.event.publish(AppGlobalService.PROFILE_OBJ_CHANGED);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    this.guestUserProfile = undefined;
                    this.event.publish(AppGlobalService.PROFILE_OBJ_CHANGED);
                });
        }
    }

    // Remove this method after refactoring formandframeworkutil.service
    private getFrameworkDetails(frameworkId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const frameworkDetailsRequest: FrameworkDetailsRequest = {
                frameworkId: frameworkId || '',
                requiredCategories: FrameworkCategoryCodesGroup.DEFAULT_FRAMEWORK_CATEGORIES
            };
            this.frameworkService.getFrameworkDetails(frameworkDetailsRequest).toPromise()
                .then((framework: Framework) => {
                    resolve(framework.categories);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    public getGuestUserInfo(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise()
                .then(val => {
                    if (val) {
                        if (val === ProfileType.STUDENT) {
                            this.guestProfileType = ProfileType.STUDENT;
                        } else if (val === ProfileType.TEACHER) {
                            this.guestProfileType = ProfileType.TEACHER;
                        } else if (val === ProfileType.OTHER) {
                            this.guestProfileType = ProfileType.OTHER;
                        }
                        this.isGuestUser = true;
                        resolve(this.guestProfileType);
                    }
                }).catch(() => {
                    reject();
                });
        });
    }

    private listenForEvents() {
        this.event.subscribe(AppGlobalService.USER_INFO_UPDATED, () => {
            this.initValues();
        });

        this.event.subscribe('refresh:profile', () => {
            this.initValues();
        });

        this.event.subscribe('refresh:loggedInProfile', () => {
            this.initValues();
        });

    }

    async openPopover(upgradeData: any) {
        let shouldDismissAlert = true;

        if (upgradeData.type === 'force' || upgradeData.type === 'forced') {
            shouldDismissAlert = false;
        }

        const options = {
            component: UpgradePopoverComponent,
            componentProps: { upgrade: upgradeData },
            cssClass: 'upgradePopover',
            showBackdrop: true,
            backdropDismiss: shouldDismissAlert
        };

        const popover = await this.popoverCtrl.create(options);
        await popover.present();

        popover.onDidDismiss().then(() => {
            this.telemetryGeneratorService.generateInteractTelemetry(
                InteractType.BACKDROP_DISMISSED,
                '',
                upgradeData.isOnboardingCompleted ? Environment.HOME : Environment.ONBOARDING,
                PageId.UPGRADE_POPUP,
                undefined,
                undefined,
                undefined,
                undefined,
                ID.BACKDROP_CLICKED
            );
        });
    }

    generateConfigInteractEvent(pageId: string, isOnBoardingCompleted?: boolean) {
        if (this.isGuestUser) {
            const paramsMap = new Map();
            if (pageId !== PageId.PROFILE) {
                paramsMap['isProfileSettingsCompleted'] = isOnBoardingCompleted;
            }
            const profileType = this.getGuestUserType();
            if (profileType === ProfileType.TEACHER || profileType === ProfileType.OTHER) {
                switch (pageId) {
                    case PageId.LIBRARY: {
                        paramsMap['isSignInCardConfigEnabled'] = this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_TEACHER;
                        break;
                    }
                    case PageId.COURSES: {
                        paramsMap['isSignInCardConfigEnabled'] = this.DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER;
                        break;
                    }
                    case PageId.GUEST_PROFILE: {
                        paramsMap['isSignInCardConfigEnabled'] = this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_TEACHER;
                        break;
                    }
                }

            } else {
                switch (pageId) {
                    case PageId.LIBRARY: {
                        paramsMap['isSignInCardConfigEnabled'] = this.DISPLAY_SIGNIN_FOOTER_CARD_IN_LIBRARY_TAB_FOR_STUDENT;
                        break;
                    }
                    case PageId.GUEST_PROFILE: {
                        paramsMap['isSignInCardConfigEnabled'] = this.DISPLAY_SIGNIN_FOOTER_CARD_IN_PROFILE_TAB_FOR_STUDENT;
                        break;
                    }
                }
            }

            this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
                InteractSubtype.INITIAL_CONFIG,
                Environment.HOME,
                pageId,
                undefined,
                paramsMap
            );
        }
    }

    generateAttributeChangeTelemetry(oldAttribute, newAttribute, pageId, env?) {
        if (this.TRACK_USER_TELEMETRY) {
            const values = new Map();
            values['oldValue'] = oldAttribute;
            values['newValue'] = newAttribute;

            this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
                InteractSubtype.PROFILE_ATTRIBUTE_CHANGED,
                env ? env : Environment.USER,
                pageId,
                undefined,
                values);
        }
    }

    generateSaveClickedTelemetry(profile, validation, pageId, interactSubtype) {
        if (this.TRACK_USER_TELEMETRY) {
            const values = new Map();
            values['profile'] = profile;
            values['validation'] = validation;

            this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
                interactSubtype,
                Environment.USER,
                pageId,
                undefined,
                values);
        }
    }

    getPageIdForTelemetry() {
        let pageId = PageId.LIBRARY;
        if (this.currentPageId) {
            switch (this.currentPageId.toLowerCase()) {
                case 'library':
                    pageId = PageId.LIBRARY;
                    break;
                case 'courses':
                    pageId = PageId.COURSES;
                    break;
                case 'profile':
                    pageId = PageId.PROFILE;
                    break;
                case 'downloads':
                    pageId = PageId.DOWNLOADS;
                    break;
            }
        }
        return pageId;
    }

    setAverageTime(time) {
        this.averageTime = time;
    }

    getAverageTime() {
        return this.averageTime;
    }

    setAverageScore(averageScore: any): any {
        this.averageScore = averageScore;
    }

    getAverageScore() {
        return this.averageScore;
    }

    getProfileSettingsStatus(profileDetails?): Promise<any> {
        return new Promise((resolve, reject) => {
            let profile = this.getCurrentUser();
            if (profileDetails) {
                profile = profileDetails;
            }
            this.isProfileSettingsCompleted = Boolean(this.isGuestUser
                && profile
                && profile.syllabus && profile.syllabus[0]
                && profile.board && profile.board.length
                && profile.grade && profile.grade.length
                && profile.medium && profile.medium.length);
            resolve(this.isProfileSettingsCompleted);
        });
    }


    ngOnDestroy() {
        this.event.unsubscribe(AppGlobalService.USER_INFO_UPDATED);
        this.event.unsubscribe('refresh:profile');
    }

    setSelectedBoardMediumGrade(selectedBoardMediumGrade: string): void {
        this.selectedBoardMediumGrade = selectedBoardMediumGrade;
    }

    getSelectedBoardMediumGrade(): string {
        return this.selectedBoardMediumGrade;
    }

    getIsPermissionAsked(key: string): Observable<boolean> {
        return Observable.create((observer: Observer<boolean>) => {

            this.preferences.getString(PreferenceKey.APP_PERMISSION_ASKED).subscribe(
                (permissionAsked: string | undefined) => {
                    if (!permissionAsked) {
                        this.preferences.putString(
                            PreferenceKey.APP_PERMISSION_ASKED, JSON.stringify(this.isPermissionAsked)).toPromise().then();
                        observer.next(false);
                        observer.complete();
                        return;
                    } else {
                        observer.next(JSON.parse(permissionAsked)[key]);
                        observer.complete();
                        return;
                    }
                });
        });
    }

    setIsPermissionAsked(key: string, value: boolean): void {

        this.preferences.getString(PreferenceKey.APP_PERMISSION_ASKED).subscribe(
            (permissionAsked: string | undefined) => {
                if (!permissionAsked) {
                    this.preferences.putString(
                        PreferenceKey.APP_PERMISSION_ASKED, JSON.stringify(this.isPermissionAsked)).toPromise().then();
                    return;
                } else {
                    permissionAsked = JSON.parse(permissionAsked);
                    permissionAsked[key] = value;
                    this.preferences.putString(PreferenceKey.APP_PERMISSION_ASKED, JSON.stringify(permissionAsked)).toPromise().then();
                    return;
                }
            });
    }

    get limitedShareQuizContent() {
        return this._limitedShareQuizContent;
    }

    set limitedShareQuizContent(value) {
        this._limitedShareQuizContent = value;
    }

    get isSignInOnboardingCompleted() {
        return this._isSignInOnboardingCompleted;
    }

    set isSignInOnboardingCompleted(value) {
        this._isSignInOnboardingCompleted = value;
    }
    get isJoinTraningOnboardingFlow() {
        return this.isJoinTraningOnboarding;
    }

    set isJoinTraningOnboardingFlow(value) {
        this.isJoinTraningOnboarding = value;
    }

    get signinOnboardingLoader() {
        return this._signinOnboardingLoader;
    }
    set signinOnboardingLoader(value) {
        this._signinOnboardingLoader = value;
    }

    get skipCoachScreenForDeeplink() {
        return this._skipCoachScreenForDeeplink;
    }
    set skipCoachScreenForDeeplink(value) {
        this._skipCoachScreenForDeeplink = value;
    }

    get preSignInData() {
        return this._preSignInData;
    }
    set preSignInData(value) {
        this._preSignInData = value;
    }

    get generateCourseCompleteTelemetry() {
        return this._generateCourseCompleteTelemetry;
    }
    set generateCourseCompleteTelemetry(value) {
        this._generateCourseCompleteTelemetry = value;
    }

    get generateCourseUnitCompleteTelemetry() {
        return this._generateCourseUnitCompleteTelemetry;
    }
    set generateCourseUnitCompleteTelemetry(value) {
        this._generateCourseUnitCompleteTelemetry = value;
    }

    get showCourseCompletePopup() {
        return this._showCourseCompletePopup;
    }

    set showCourseCompletePopup(value) {
        this._showCourseCompletePopup = value;
    }

    get formConfig() {
        return this._formConfig;
    }

    set formConfig(value) {
        this._formConfig = value;
    }

    get selectedActivityCourseId() {
        return this._selectedActivityCourseId;
    }

    set selectedActivityCourseId(value) {
        this._selectedActivityCourseId = value;
    }

    get redirectUrlAfterLogin() {
        return this._redirectUrlAfterLogin;
    }

    set redirectUrlAfterLogin(value) {
        this._redirectUrlAfterLogin = value;
    }


    // This method is used to reset if any quiz content data is previously saved before Joining a Training
    // So it wont affect in the exterId verification page
    resetSavedQuizContent() {
        this.limitedShareQuizContent = null;
    }

    async closeSigninOnboardingLoader() {
        if (this.signinOnboardingLoader) {
            await this.signinOnboardingLoader.dismiss();
            this.signinOnboardingLoader = null;
        }
    }

    async showTutorialScreen() {
        if (this.skipCoachScreenForDeeplink) {
            this.skipCoachScreenForDeeplink = false;
        } else {
            const tutorialScreen = await this.preferences.getBoolean(PreferenceKey.COACH_MARK_SEEN).toPromise();
            if (!tutorialScreen) {
                const appLabel = await this.appVersion.getAppName();
                const tutorialPopover = await this.popoverCtrl.create({
                    component: SbTutorialPopupComponent,
                    componentProps: { appLabel },
                    showBackdrop: true,
                    backdropDismiss: false,
                    enterAnimation: animationGrowInTopRight,
                    leaveAnimation: animationShrinkOutTopRight
                });
                tutorialPopover.present();
                this.preferences.putBoolean(PreferenceKey.COACH_MARK_SEEN, true).toPromise().then();
            }
        }
    }

    async getActiveProfileUid() {
        let userId = '';
        try {
            const activeProfileSession: ProfileSession = await this.profile.getActiveProfileSession().toPromise();

            userId = activeProfileSession.uid;
            if (activeProfileSession.managedSession) {
                userId = activeProfileSession.managedSession.uid;
            }
        } catch (e) {
            console.error(e);
        }

        return userId;
    }

}
