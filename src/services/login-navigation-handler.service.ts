import { EventTopics, IgnoreTelemetryPatters, PreferenceKey, ProfileConstants, SystemSettingsIds } from '@app/app/app.constant';
import { Environment, InteractType, PageId } from '@app/services/telemetry-constants';
import { Context as SbProgressLoaderContext, SbProgressLoader } from '@app/services/sb-progress-loader.service';
import {
    SharedPreferences,
    ProfileService,
    AuthService,
    ProfileType,
    Profile,
    ServerProfileDetailsRequest,
    ProfileSource,
    SignInError,
    SystemSettingsService
} from 'sunbird-sdk';
import { initTabs, LOGIN_TEACHER_TABS } from '@app/app/module.service';
import { Inject, Injectable, NgZone } from '@angular/core';
import { Events } from '@app/util/events';
import { AppGlobalService } from '@app/services/app-global-service.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { ContainerService } from '@app/services/container.services';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { CommonUtilService } from '@app/services/common-util.service';
import { FormAndFrameworkUtilService } from '@app/services/formandframeworkutil.service';
import { mergeMap, tap } from 'rxjs/operators';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Platform } from '@ionic/angular';

@Injectable()
export class LoginNavigationHandlerService {

    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('AUTH_SERVICE') private authService: AuthService,
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
        private sbProgressLoader: SbProgressLoader,
        private events: Events,
        private appGlobalService: AppGlobalService,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private container: ContainerService,
        private ngZone: NgZone,
        private appVersion: AppVersion,
        private commonUtilService: CommonUtilService,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private platform: Platform,
        private googlePlusLogin: GooglePlus,
    ) {
    }

    async setSession(webViewSession, skipNavigation, subType: string) {
        try {
            await this.authService.setSession(webViewSession).toPromise();

            await this.sbProgressLoader.show(this.generateIgnoreTelemetryContext());
            const value = await this.setProfileDetailsAndRefresh(skipNavigation, subType);
            console.log('value ', value);

            await this.refreshTenantData(value.slug, value.title);

            this.ngZone.run(() => {
                this.preferences.putString(PreferenceKey.NAVIGATION_SOURCE,
                    (skipNavigation && skipNavigation.source) || PageId.MENU).toPromise();
                this.preferences.putString('SHOW_WELCOME_TOAST', 'true').toPromise().then();
                this.events.publish(EventTopics.SIGN_IN_RELOAD, skipNavigation);
                this.sbProgressLoader.hide({ id: 'login' });
            });
        } catch (err) {
            await this.logoutOnImpropperLoginProcess();

            this.sbProgressLoader.hide({ id: 'login' });
            if (err && err.error_msg) {
                this.commonUtilService.showToast(err.error_msg, false, 'red-toast');
                throw err;
            } else if (err instanceof SignInError) {
                this.commonUtilService.showToast(err.message);
            } else {
                this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
            }
        }
    }

    private async setProfileDetailsAndRefresh(skipNavigation, subType) {
        try {
            const isOnboardingCompleted = (await this.preferences.getString(PreferenceKey.IS_ONBOARDING_COMPLETED).toPromise() === 'true');
            if (!isOnboardingCompleted) {
                await this.setDefaultProfileDetails();

                // To avoid race condition
                if (this.appGlobalService.limitedShareQuizContent) {
                    this.appGlobalService.skipCoachScreenForDeeplink = true;
                }
            }
            if (skipNavigation && skipNavigation.redirectUrlAfterLogin) {
                this.appGlobalService.redirectUrlAfterLogin = skipNavigation.redirectUrlAfterLogin;
            }
            this.appGlobalService.preSignInData = (skipNavigation && skipNavigation.componentData) || null;
            initTabs(this.container, LOGIN_TEACHER_TABS);
            const profileData = await this.refreshProfileData(subType);
            return profileData;
        } catch (err) {
            return Promise.reject(err);
        }
    }

    private refreshProfileData(subType: string) {
        const that = this;

        return new Promise<any>(async (resolve, reject) => {
            try {
                const session = await that.authService.getSession().toPromise();

                if (session) {
                    const req: ServerProfileDetailsRequest = {
                        userId: session.userToken,
                        requiredFields: ProfileConstants.REQUIRED_FIELDS
                    };
                    this.appGlobalService.isGuestUser = false;
                    const success: any = await that.profileService.getServerProfilesDetails(req).toPromise();

                    const selectedUserType = await this.preferences.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();

                    const currentProfileType = (() => {
                        if (selectedUserType === ProfileType.ADMIN) {
                            return selectedUserType;
                        } else if (
                            (success.profileUserType.type === ProfileType.OTHER.toUpperCase()) ||
                            (!success.profileUserType.type)
                        ) {
                            return ProfileType.NONE;
                        }

                        return success.profileUserType.type.toLowerCase();
                    })();
                    this.generateLoginInteractTelemetry(InteractType.SUCCESS, subType, success.id);
                    const profile: Profile = {
                        uid: success.id,
                        handle: success.id,
                        profileType: currentProfileType,
                        source: ProfileSource.SERVER,
                        serverProfile: success
                    };
                    await this.profileService.createProfile(profile, ProfileSource.SERVER).toPromise()

                    await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, currentProfileType).toPromise();
                    await that.profileService.setActiveSessionForProfile(profile.uid).toPromise()

                    try {
                        that.formAndFrameworkUtilService.updateLoggedInUser(success, profile)
                    } catch (e) {
                        console.error(e);
                    } finally {
                        resolve({ slug: success.rootOrg.slug, title: success.rootOrg.orgName });
                    }
                } else {
                    reject('session is null');
                }
            } catch (err) {
                reject(err);
            }

        });
    }

    private refreshTenantData(slug: string, title: string) {
        return new Promise<void>(async (resolve, reject) => {

            try {
                const tenantInfo = await this.profileService.getTenantInfo({ slug: '' }).toPromise();
                const isDefaultChannelProfile = await this.profileService.isDefaultChannelProfile().toPromise();
                if (isDefaultChannelProfile) {
                    title = await this.appVersion.getAppName();
                }
                this.preferences.putString(PreferenceKey.APP_LOGO, tenantInfo.logo).toPromise().then();
                this.preferences.putString(PreferenceKey.APP_NAME, title).toPromise().then();
                (window as any).splashscreen.setContent(title, tenantInfo.appLogo);
                resolve();
            } catch (error) {
                resolve();
            }
        });
    }

    private generateIgnoreTelemetryContext(): SbProgressLoaderContext {
        return {
            id: 'login',
            ignoreTelemetry: {
                when: {
                    interact: IgnoreTelemetryPatters.IGNORE_SIGN_IN_PAGE_ID_EVENTS,
                    impression: IgnoreTelemetryPatters.IGNORE_CHANNEL_IMPRESSION_EVENTS
                }
            }
        };
    }

    generateLoginInteractTelemetry(interactType, interactSubtype, uid) {
        const valuesMap = new Map();
        valuesMap['UID'] = uid;
        this.telemetryGeneratorService.generateInteractTelemetry(
            interactType,
            interactSubtype,
            Environment.HOME,
            PageId.LOGIN,
            undefined,
            valuesMap);
    }

    setDefaultProfileDetails(): Promise<string | void> {
        const profileRequest = this.getDefaultProfileRequest();
        return this.profileService.updateProfile(profileRequest).toPromise().then(() => {
            return this.profileService.setActiveSessionForProfile(profileRequest.uid).toPromise().then(() => {
                return this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise()
                    .then((success: any) => {
                        const userId = success.uid;
                        this.events.publish(AppGlobalService.USER_INFO_UPDATED);
                        if (userId !== 'null') {
                            this.preferences.putString(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN, userId).toPromise().then();
                        }
                    }).catch(() => {
                        return 'null';
                    });
            });
        });
    }

    private getDefaultProfileRequest() {
        const profile = this.appGlobalService.getCurrentUser();
        const profileRequest: Profile = {
            uid: profile.uid,
            handle: profile.handle || 'Guest1',
            medium: profile.medium || [],
            board: profile.board || [],
            subject: profile.subject || [],
            profileType: profile.profileType || ProfileType.TEACHER,
            grade: profile.grade || [],
            syllabus: profile.syllabus || [],
            source: profile.source || ProfileSource.LOCAL
        };
        return profileRequest;
    }

    private async logoutOnImpropperLoginProcess() {
        await this.logoutGoogle();

        if (this.platform.is('ios')) {
            this.profileService.getActiveProfileSession().toPromise()
                .then((profile) => {
                    this.profileService.deleteProfile(profile.uid).subscribe()
                });
        }

        this.preferences.getString(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN).pipe(
            tap(async (guestUserId: string) => {
                if (!guestUserId) {
                    await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, ProfileType.TEACHER).toPromise();
                } else {
                    const allProfileDetais = await this.profileService.getAllProfiles().toPromise();
                    const currentProfile = allProfileDetais.find(ele => ele.uid === guestUserId);
                    const guestProfileType = (currentProfile && currentProfile.profileType) ? currentProfile.profileType : ProfileType.NONE;
                    await this.preferences.putString(PreferenceKey.SELECTED_USER_TYPE, guestProfileType).toPromise();
                }
            }),
            mergeMap((guestUserId: string) => {
                return this.profileService.setActiveSessionForProfile(guestUserId);
            }),
            mergeMap(() => {
                return this.authService.resignSession();
            }),
            tap(async () => {
                this.events.publish(AppGlobalService.USER_INFO_UPDATED);
                this.appGlobalService.setEnrolledCourseList([]);
            })
        ).subscribe();

    }

    private async logoutGoogle() {
        if (await this.preferences.getBoolean(PreferenceKey.IS_GOOGLE_LOGIN).toPromise()) {
            try {
                await this.googlePlusLogin.disconnect();
            } catch (e) {
                const clientId = await this.systemSettingsService.getSystemSettings({ id: SystemSettingsIds.GOOGLE_CLIENT_ID }).toPromise();
                await this.googlePlusLogin.trySilentLogin({
                    webClientId: clientId.value
                }).then(async () => {
                    await this.googlePlusLogin.disconnect();
                }).catch((err) => {
                    console.log(err);
                });
            }
            this.preferences.putBoolean(PreferenceKey.IS_GOOGLE_LOGIN, false).toPromise();
        }
    }

}
