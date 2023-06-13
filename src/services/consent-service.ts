import { Inject, Injectable } from '@angular/core';
import { Consent, ProfileService } from '@project-sunbird/sunbird-sdk';
import { ConsentPiiPopupComponent } from '../app/components/popups/consent-pii-popup/consent-pii-popup.component';
import { PopoverController } from '@ionic/angular';
import { ConsentStatus, UserDeclarationOperation } from '@project-sunbird/client-services/models';
import { CommonUtilService } from './common-util.service';

@Injectable()
export class ConsentService {
    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        private popoverCtrl: PopoverController,
        private commonUtilService: CommonUtilService
    ) { }

    async showConsentPopup(userDetails, isOrgConsent?, course?) {
        const popover = await this.popoverCtrl.create({
            component: ConsentPiiPopupComponent,
            componentProps: {
                isSSOUser: isOrgConsent,
                course
            },
            cssClass: 'sb-popover back-drop-hard',
            backdropDismiss: false
        });
        await popover.present();
        const dismissResponse = await popover.onDidDismiss();
        const request: Consent = {
            status: isOrgConsent ? ConsentStatus.ACTIVE : (dismissResponse.data.data ? ConsentStatus.ACTIVE : ConsentStatus.REVOKED),
            userId: isOrgConsent ? userDetails.uid : (userDetails.userId ? userDetails.userId : dismissResponse.data.userId),
            consumerId: isOrgConsent ? userDetails.serverProfile.rootOrg.rootOrgId : (
                userDetails.channel ? userDetails.channel : userDetails.content.channel),
            objectId: isOrgConsent ? userDetails.serverProfile.rootOrg.rootOrgId : userDetails.courseId,
            objectType: isOrgConsent ? 'Organisation' : 'Collection'
        };
        const loader = await this.commonUtilService.getLoader();
        await loader.present();
        await this.profileService.updateConsent(request).toPromise()
            .then(async (data) => {
                if (!isOrgConsent) {
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

    async getConsent(userDetails, isOrgConsent?, course?) {
        const request: Consent = {
            userId: isOrgConsent ? userDetails.uid : userDetails.userId,
            consumerId: isOrgConsent ? userDetails.serverProfile.rootOrg.rootOrgId : userDetails.channel,
            objectId: isOrgConsent ? userDetails.serverProfile.rootOrg.rootOrgId :
                (userDetails.courseId ? userDetails.courseId : userDetails.batch.courseId),
            objectType: isOrgConsent ? 'Organisation' : undefined
        };
        await this.profileService.getConsent(request).toPromise()
            .then((data) => {
            })
            .catch(async (e) => {
                if (e.response.body.params.err === 'USER_CONSENT_NOT_FOUND' && e.response.responseCode === 404) {
                    await this.showConsentPopup(userDetails, isOrgConsent, course);
                } else if (e.code === 'NETWORK_ERROR') {
                    this.commonUtilService.showToast('ERROR_NO_INTERNET_MESSAGE');
                }
            });
        if (isOrgConsent) {
            await this.updateProfileDeclaration(userDetails);
        }
    }

    private async updateProfileDeclaration(userDetails) {
        let id = '';
        if (userDetails.serverProfile.externalIds && userDetails.serverProfile.externalIds.length) {
            const externalId = userDetails.serverProfile.externalIds.
                find(element => element.provider === userDetails.serverProfile.channel);
            id = externalId && externalId.id;
        }
        const declarations = [
            {
                operation: UserDeclarationOperation.ADD,
                userId: userDetails.uid,
                persona: '',
                orgId: userDetails.serverProfile.rootOrg.rootOrgId,
                info: {
                    'declared-ext-id': id,
                    'declared-phone': '',
                    'declared-email': ''
                }
            }
        ];
        try {
            await this.profileService.updateServerProfileDeclarations({ declarations }).toPromise();
        } catch (e) {
        }
    }
}
