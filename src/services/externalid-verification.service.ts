import { Router } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { ProfileService, SharedPreferences } from 'sunbird-sdk';
import { AppGlobalService } from './app-global-service.service';
import { Observable } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import {
    TeacherIdVerificationComponent
} from '@app/app/components/popups/teacher-id-verification-popup/teacher-id-verification-popup.component';
import {PreferenceKey, ProfileConstants} from '@app/app/app.constant';
import { map } from 'rxjs/operators';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { CommonUtilService } from './common-util.service';
import { LocalCourseService } from './local-course.service';
import {PageId} from '@app/services/telemetry-constants';

@Injectable()
export class ExternalIdVerificationService {
    public isCustodianUser$: Observable<boolean>;

    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private appGlobalService: AppGlobalService,
        private popoverCtrl: PopoverController,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
        private commonUtilService: CommonUtilService,
        private localCourseService: LocalCourseService,
        private router: Router
    ) {
        this.isCustodianUser$ = this.profileService.isDefaultChannelProfile().pipe(
            map((isDefaultChannelProfile) => isDefaultChannelProfile) as any
        );
    }

    async showExternalIdVerificationPopup() {
        this.appGlobalService.closeSigninOnboardingLoader();
        if (this.appGlobalService.redirectUrlAfterLogin) {
            this.router.navigate(
                [this.appGlobalService.redirectUrlAfterLogin],
                {
                    state: {
                        fromRegistrationFlow: true
                    },
                    replaceUrl: true
                }
            );
            this.appGlobalService.redirectUrlAfterLogin = '';
        }
        if (await this.checkQuizContent()) {
            await this.resetNavigationSource();
            return;
        }
        const profileSession = await this.profileService.getActiveProfileSession().toPromise();
        if (profileSession.managedSession) {
            await this.resetNavigationSource();
            return;
        }
        const session = await this.appGlobalService.authService.getSession().toPromise();
        if (!this.commonUtilService.networkInfo.isNetworkAvailable || !session) {
            await this.resetNavigationSource();
            return;
        }
        const isCustodianUser = await this.isCustodianUser$.toPromise();
        const serverProfile = await this.profileService.getServerProfilesDetails({
            userId: session.userToken,
            requiredFields: ProfileConstants.REQUIRED_FIELDS,
        }).toPromise();
        if (isCustodianUser) {
            await this.profileService.getUserFeed().toPromise()
                .then(async (userFeed: any) => {
                        if (userFeed[0] && (userFeed[0].category).toLowerCase() === 'orgmigrationaction') {
                            let popupLabels = {};
                            let tenantSpecificMessages: any;
                            if (userFeed[0].data.prospectChannelsIds.length > 1 || !userFeed[0].data.prospectChannelsIds[0].id) {
                                 tenantSpecificMessages = await this.formAndFrameworkUtilService.
                                getTenantSpecificMessages(serverProfile.rootOrg.rootOrgId);
                            } else {
                                tenantSpecificMessages = await this.formAndFrameworkUtilService.
                                getTenantSpecificMessages(userFeed[0].data.prospectChannelsIds[0].id);
                            }
                            if (tenantSpecificMessages && tenantSpecificMessages.length && tenantSpecificMessages[0].range
                                && tenantSpecificMessages[0].range.length) {
                                popupLabels = tenantSpecificMessages[0].range[0];
                            }
                            const popover = await this.popoverCtrl.create({
                                component: TeacherIdVerificationComponent,
                                backdropDismiss: false,
                                cssClass: 'popover-alert popoverPosition',
                                componentProps: {
                                    userFeed: userFeed[0], tenantMessages: popupLabels
                                }
                            });
                            await popover.present();
                        }
                })
                .catch((error) => {
                    console.log('error', error);
                });
        }
        if (await this.checkJoinTraining()) {
            await this.resetNavigationSource();
            return;
        }
        const source = await this.preferences.getString(PreferenceKey.NAVIGATION_SOURCE).toPromise();
        if (source === 'courses') {
            this.router.navigateByUrl('tabs/courses');
        }
        await this.resetNavigationSource();
    }

    checkQuizContent(): Promise<boolean> {
        this.appGlobalService.isSignInOnboardingCompleted = true;
        return new Promise<boolean>(async (resolve) => {
            const limitedSharingContentId = this.appGlobalService.limitedShareQuizContent;
            if (limitedSharingContentId) {
                this.appGlobalService.limitedShareQuizContent = null;
                this.splaschreenDeeplinkActionHandlerDelegate.navigateContent(limitedSharingContentId);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    checkJoinTraining() {
        if (this.appGlobalService.isJoinTraningOnboardingFlow) {
            return new Promise<boolean>(async (resolve) => {
                await this.localCourseService.checkCourseRedirect();
                this.appGlobalService.isJoinTraningOnboardingFlow = false;
                resolve(true);
            });
        }
    }

    private async resetNavigationSource() {
        await this.preferences.putString(PreferenceKey.NAVIGATION_SOURCE, '').toPromise();
    }
}
