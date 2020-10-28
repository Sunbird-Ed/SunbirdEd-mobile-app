import { Inject, Injectable } from '@angular/core';
import { Consent, ProfileService } from 'sunbird-sdk';
import { ConsentPiiPopupComponent } from '@app/app/components/popups/consent-pii-popup/consent-pii-popup.component';
import { PopoverController } from '@ionic/angular';
import { ConsentStatus } from '@project-sunbird/client-services/models';
import { CommonUtilService } from './common-util.service';

@Injectable()
export class ConsentService {
    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        private popoverCtrl: PopoverController,
        private commonUtilService: CommonUtilService
    ) { }

    async showConsentPopup(userDetails, isGlobal?) {
        const popover = await this.popoverCtrl.create({
            component: ConsentPiiPopupComponent,
            componentProps: {
                isSSOUser: isGlobal ? true : false
            },
            cssClass: 'sb-popover',
            backdropDismiss: false
        });
        await popover.present();
        const dismissResponse = await popover.onDidDismiss();
        const request: Consent = {
            status: isGlobal ? ConsentStatus.ACTIVE : (dismissResponse.data.data ? ConsentStatus.ACTIVE : ConsentStatus.REVOKED),
            userId: isGlobal ? userDetails.uid : (userDetails.userId ? userDetails.userId : dismissResponse.data.userId),
            consumerId: isGlobal ? userDetails.serverProfile.rootOrg.rootOrgId : (
                userDetails.channel ? userDetails.channel : userDetails.content.channel),
            objectId: isGlobal ? userDetails.serverProfile.rootOrg.rootOrgId : userDetails.courseId,
            objectType: isGlobal ? 'Organisation' : 'Collection'
        };
        const loader = await this.commonUtilService.getLoader();
        await loader.present();
        await this.profileService.updateConsent(request).toPromise()
            .then(async (data) => {
                if (!isGlobal) {
                    this.commonUtilService.showToast('FRMELEMNTS_MSG_DATA_SETTINGS_SUBMITED_SUCCESSFULLY');
                }
                await loader.dismiss();
            })
            .catch((e) => {
                loader.dismiss();
                if (e.code === 'NETWORK_ERROR') {
                    this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
                }
            });
    }

    async checkedUserConsent(userDetails, isGlobal?) {
        const request: Consent = {
            userId: isGlobal ? userDetails.uid : userDetails.userId,
            consumerId: isGlobal ? userDetails.serverProfile.rootOrg.rootOrgId : userDetails.channel,
            objectId: isGlobal ? userDetails.serverProfile.rootOrg.rootOrgId :
             (userDetails.courseId ? userDetails.courseId : userDetails.batch.courseId),
             objectType: isGlobal ? 'Organisation' : undefined
        };
        await this.profileService.getConsent(request).toPromise()
            .then((data) => {
            })
            .catch(async (e) => {
                if (e.response.body.params.err === 'USER_CONSENT_NOT_FOUND' && e.response.responseCode === 404) {
                    await this.showConsentPopup(userDetails, isGlobal);
                } else if (e.code === 'NETWORK_ERROR') {
                    this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
                }
            });
    }
}
