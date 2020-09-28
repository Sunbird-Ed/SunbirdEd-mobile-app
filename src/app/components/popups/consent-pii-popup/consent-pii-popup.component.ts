import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { CommonUtilService, FormAndFrameworkUtilService, AppGlobalService, UtilityService } from '@app/services';
import { RouterLinks } from '@app/app/app.constant';

@Component({
    selector: 'app-consent-pii-popup',
    templateUrl: './consent-pii-popup.component.html',
    styleUrls: ['./consent-pii-popup.component.scss'],
})


export class ConsentPiiPopupComponent {
    profile: any;
    consentForm = [];
    isAgreed = false;
    appName: string;
    constructor(
        private popOverCtrl: PopoverController,
        private commonUtilService: CommonUtilService,
        private formAndFrameworkUtilService: FormAndFrameworkUtilService,
        private appGlobalService: AppGlobalService,
        private utilityService: UtilityService,
    ) { }
    async ionViewWillEnter() {
        this.profile = this.appGlobalService.getCurrentUser();
        const profileKeys = await this.formAndFrameworkUtilService.getConsentFormConfig();
        profileKeys.forEach(element => {
            this.consentForm.push({
                key: this.commonUtilService.getTranslatedValue(element.templateOptions.placeHolder, ''),
                value: this.converDataSrcToObject(element)
            });
        });
        this.commonUtilService.getAppName().then((res) => { this.appName = res; });
    }
    closePopover(data) {
        const request = {
            data,
            userId: this.profile.serverProfile.id
        };
        this.popOverCtrl.dismiss(request);
    }
    dontShare() {
        this.closePopover(false);
    }
    share() {
        this.closePopover(true);
    }

    converDataSrcToObject(ele) {
        const dataSrc = ele.templateOptions.dataSrc;
        switch (dataSrc.marker) {
            case 'SERVER_PROFILE':
                return this.profile.serverProfile[dataSrc.params.categoryCode] ?
                    this.profile.serverProfile[dataSrc.params.categoryCode] : '-';
            case 'SERVER_PROFILE_LOCATIONS':
                let location = '-';
                if (this.profile.serverProfile.userLocations && this.profile.serverProfile.userLocations.length) {
                    this.profile.serverProfile.userLocations.forEach(element => {
                        if (element.type === ele.code) {
                            location = element.name;
                        }
                    });
                }
                return location;
            case 'SERVER_PROFILE_DECLARED':
                if (this.profile.serverProfile.declarations.length && this.profile.serverProfile.declarations[0].info) {
                   return this.profile.serverProfile.declarations[0].info[dataSrc.params.categoryCode] ?
                   this.profile.serverProfile.declarations[0].info[dataSrc.params.categoryCode] : '-';
                }
                return '-';
            default:
                return '-';
        }
    }

    async openTermsOfUse() {
        const baseUrl = await this.utilityService.getBuildConfigValue('TOU_BASE_URL');
        const url = baseUrl + RouterLinks.TERM_OF_USE;
        const options
            = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';

        (window as any).cordova.InAppBrowser.open(url, '_blank', options);
    }

    changeEvent(event) {
        if (event.detail.checked) {
            this.isAgreed = true;
        } else {
            this.isAgreed = false;
        }
    }
}
