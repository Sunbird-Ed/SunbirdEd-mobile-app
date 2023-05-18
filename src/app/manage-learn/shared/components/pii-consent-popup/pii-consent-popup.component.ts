import { Component, Input, OnInit } from '@angular/core';
import { AppGlobalService, CommonUtilService, FormAndFrameworkUtilService, UtilityService } from '../../../../../../src/services';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-pii-consent-popup',
  templateUrl: './pii-consent-popup.component.html',
  styleUrls: ['./pii-consent-popup.component.scss'],
})
export class PiiConsentPopupComponent implements OnInit {

  @Input() consentMessage1
  @Input() consentMessage2
  @Input() consentMessage3
  @Input() redirectLink
  isAgreed=false
  profile
  detailsList=[]

  constructor(private appGlobalService: AppGlobalService, private formAndFrameworkUtilService: FormAndFrameworkUtilService,
    private commonUtilService: CommonUtilService, private popoverCtrl: PopoverController, private utilityService: UtilityService) { }

  ngOnInit() {}

  async ionViewWillEnter() {
    this.profile = this.appGlobalService.getCurrentUser();
    const profileKeys = await this.formAndFrameworkUtilService.getConsentFormConfig();
    profileKeys.forEach(element => {
        this.detailsList.push({
            key: this.commonUtilService.getTranslatedValue(element.templateOptions.placeHolder,
                JSON.parse(element.templateOptions.placeHolder)['en']),
            value: this.convertDataSrcToObject(element)
        });
    });
}


convertDataSrcToObject(ele) {
  const dataSrc = ele.templateOptions.dataSrc;
  switch (dataSrc.marker) {
      case 'SERVER_PROFILE':
          if (ele.code === 'emailId' || ele.code === 'phoneNumber') {
              if (ele.code === 'emailId') {
                  return this.profile.serverProfile['email'] ?  this.profile.serverProfile['email'] :
                  (this.profile.serverProfile['maskedEmail'] ? this.profile.serverProfile['maskedEmail'] : '-');
              } else {
                return this.profile.serverProfile['phone'] ?  this.profile.serverProfile['phone'] :
                (this.profile.serverProfile['maskedPhone'] ? this.profile.serverProfile['maskedPhone'] : '-');
              }
            } else {
              if (ele.code === 'externalIds') {
                  let externalId = '-';
                  if (this.profile.serverProfile[dataSrc.params.categoryCode] ) {
                      this.profile.serverProfile[dataSrc.params.categoryCode].forEach((externaleId) => {
                        if (externaleId.provider === this.profile.serverProfile.channel) {
                          externalId = externaleId.id;
                        }
                      });
                    }
                  return externalId;
              } else {
                  return this.profile.serverProfile[dataSrc.params.categoryCode] ?
                  this.profile.serverProfile[dataSrc.params.categoryCode] : '-';
              }
            }
      case 'SERVER_PROFILE_LOCATIONS':
          let location = '-';
          if (this.profile.serverProfile.userLocations && this.profile.serverProfile.userLocations.length) {
              this.profile.serverProfile.userLocations.forEach(element => {
                  if (element.type === ele.code) {
                      location = element.name;
                  } else if (ele.code === 'schoolId' && element.type === 'school' ) {
                      location = element.code;
                  }
              });
          }
          return location;
          case 'SERVER_PROFILE_DECLARED':
              if (this.profile.serverProfile.declarations.length && this.profile.serverProfile.declarations[0].info) {
                 return this.profile.serverProfile.declarations[0].info[dataSrc.params.categoryCode] ?
                 this.profile.serverProfile.declarations[0].info[dataSrc.params.categoryCode] : '-';
              } else if (ele.code === 'emailId' || ele.code === 'phoneNumber') {
                if (ele.code === 'emailId') {
                    return this.profile.serverProfile['maskedEmail'] ? this.profile.serverProfile['maskedEmail'] : '-';
                } else {
                  return this.profile.serverProfile['maskedPhone'] ? this.profile.serverProfile['maskedPhone'] : '-';
                }
              }
              return '-';
      default:
          return '-';
  }
}


  async openTermsOfUse(){
    const baseUrl = await this.utilityService.getBuildConfigValue('TOU_BASE_URL');
    const url = baseUrl + this.redirectLink;
    const options = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';
    (window as any).cordova.InAppBrowser.open(url, '_blank', options);
  }

  changeEvent(event) {
    this.isAgreed = event.target.checked;
  }

  share() {
    this.popoverCtrl.dismiss(true)
  }

  dontShare() {
    this.popoverCtrl.dismiss(false)
  }

}
