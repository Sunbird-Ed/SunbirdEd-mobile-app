import { Injectable, Inject } from '@angular/core';
import { ProfileService, UserFeed } from 'sunbird-sdk';
import { AppGlobalService } from './app-global-service.service';
import { Observable } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import {
    TeacherIdVerificationComponent
} from '@app/app/components/popups/teacher-id-verification-popup/teacher-id-verification-popup.component';
import { ProfileConstants } from '@app/app/app.constant';
import { map } from 'rxjs/operators';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { CommonUtilService } from './common-util.service';
import { LocalCourseService } from './local-course.service';

@Injectable()
export class ExternalIdVerificationService {
    public isCustodianUser$: Observable<boolean>;

    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        private appGlobalService: AppGlobalService,
        private popoverCtrl: PopoverController,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
        private commonUtilService: CommonUtilService,
        private localCourseService: LocalCourseService
    ) {
        this.isCustodianUser$ = this.profileService.isDefaultChannelProfile().pipe(
            map((isDefaultChannelProfile) => isDefaultChannelProfile) as any
        );
    }

    async showExternalIdVerificationPopup() {
        this.appGlobalService.closeSigninOnboardingLoader();
        if (await this.checkQuizContent()) {
            return;
        }
        if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
            return;
        }
        const session = await this.appGlobalService.authService.getSession().toPromise();
        const isCustodianUser = await this.isCustodianUser$.toPromise();
        const serverProfile = await this.profileService.getServerProfilesDetails({
            userId: session.userToken,
            requiredFields: ProfileConstants.REQUIRED_FIELDS,
        }).toPromise();
        const tenantSpecificMessages: any = await this.formAndFrameworkUtilService.
            getTenantSpecificMessages(serverProfile.rootOrg.rootOrgId);
        if (session && isCustodianUser) {
            await this.profileService.getUserFeed().toPromise()
                .then(async (userFeed: UserFeed[]) => {
                    if (userFeed[0] && (userFeed[0].category).toLowerCase() === 'orgmigrationaction') {
                        let popupLabels = {};
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
            return;
        }
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
}
