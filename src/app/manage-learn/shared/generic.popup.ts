import { EventEmitter, Inject, Injectable } from '@angular/core';
import { PrivacyPolicyAndTCComponent } from './components/privacy-policy-and-tc/privacy-policy-and-tc.component';
import { PopoverController } from '@ionic/angular';
import { SbGenericPopoverComponent } from '../../../app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { CommonUtilService } from '../../../services/common-util.service';
import { StartImprovementComponent } from './components/start-improvement/start-improvement.component';
import { PiiConsentPopupComponent } from './components/pii-consent-popup/pii-consent-popup.component';
import { RouterLinks } from '../../../app/app.constant';
import { JoinProgramComponent } from './components/join-program/join-program.component';
import { ProfileService } from '@project-sunbird/sunbird-sdk';
import { ConsentStatus } from '@project-sunbird/client-services/models';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { KendraApiService } from '../core/services/kendra-api.service';
import { urlConstants } from '../core/constants/urlConstants';

@Injectable({
  providedIn: 'root',
})
export class GenericPopUpService {
  consentPopup: any
  joinProgramPopup:any
  consentStatus: EventEmitter<any> = new EventEmitter<any>();
  constructor(private popOverCtrl: PopoverController, private commonUtils: CommonUtilService, @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private appGlobalService: AppGlobalService,
     private kendra : KendraApiService
     ) {}

    async showPPPForProjectPopUp(message, message1, linkLabel, header, link, type) {
        const alert = await this.popOverCtrl.create({
            component: PrivacyPolicyAndTCComponent,
            componentProps: {
                message: message,
                message1: message1,
                linkLabel: linkLabel,
                header: header,
                isPrivacyPolicy: type == 'privacyPolicy' ? true : false
            },
            cssClass: 'sb-popover',
        });
        await alert.present();
        const { data } = await alert.onDidDismiss();
        return data;
    }
  async confirmBox(...args:any) {
    args = Object.assign({}, ...args);
    let buttons = [];
    args.yes && buttons.push({
       btntext: this.commonUtils.translateMessage(args.yes),
       btnClass: 'sb-btn sb-btn-sm  sb-btn-outline-info',
    })
    args.no &&
      buttons.push({
        btntext: this.commonUtils.translateMessage(args.no),
        btnClass: 'popover-color',
      });
    const alert = await this.popOverCtrl.create({
      component: SbGenericPopoverComponent,
      componentProps: {
        sbPopoverHeading:args.heading ? this.commonUtils.translateMessage(args.heading):'',
        sbPopoverMainTitle:args.title ? this.commonUtils.translateMessage(args.title):'',
        sbPopoverContent: args.content ? this.commonUtils.translateMessage(args.content) : '',
        showHeader:args.header? true:false,
        actionsButtons: buttons,
        icon: null,
      },
      cssClass: 'sb-popover',
    });
    await alert.present();
    setTimeout(() => {
      args.autoDissmiss?alert.dismiss({ isLeftButtonClicked: true }):''
    },1000);
    const { data } = await alert.onDidDismiss();
    return data.isLeftButtonClicked;
  }

  async showStartIMPForProjectPopUp(header,message, message1, button) {
    const alert = await this.popOverCtrl.create({
        component: StartImprovementComponent,
        componentProps: {
            message: message,
            message1: message1,
            header: header,
            button: button
        },
        cssClass: 'sb-popover',
    });
    await alert.present();
    const { data } = await alert.onDidDismiss();
    return data;
}

async showJoinProgramForProjectPopup(header,name,type,button,message?){
  this.joinProgramPopup = await this.popOverCtrl.create({
    component : JoinProgramComponent,
    componentProps: {
      header: header,
      name: name,
      type:type,
      button: button,
      message: message
    },
    cssClass: 'sb-popover',
  });
  await this.joinProgramPopup.present();
  const {data} = await this.joinProgramPopup.onDidDismiss();
  return data

}

async showConsent(type, payload, details, profileData, message?){
  let componentProps={}
  let payloadData:any = { userId : this.appGlobalService.getUserId(), objectType: type, ...payload }
  switch (type.toLowerCase()) {
    case 'program':
      componentProps={
        consentMessage1 : "FRMELEMNTS_LBL_CONSENT_POPUP_MSG1",
        consentMessage2 : "FRMELEMNTS_LBL_CONSENT_POPUP_POLICY_MSG",
        consentMessage3 : "FRMELEMNTS_LBL_CONSENT_POPUP_MSG2",
        redirectLink : RouterLinks.TERM_OF_USE
      }
      break;

    default:
      componentProps={
        consentMessage1 : "FRMELEMNTS_LBL_CONSENT_POPUP_MSG1",
        consentMessage2 : "FRMELEMNTS_LBL_CONSENT_POPUP_POLICY_MSG",
        consentMessage3 : "FRMELEMNTS_LBL_CONSENT_POPUP_MSG2",
        redirectLink : RouterLinks.TERM_OF_USE
      }
      break;
  }
  this.consentPopup = await this.popOverCtrl.create({
    component : PiiConsentPopupComponent,
    componentProps : componentProps,
    cssClass: 'sb-popover back-drop-hard',
    backdropDismiss: false
  })
  await this.consentPopup.present()
  let {data} = await this.consentPopup.onDidDismiss()
  if(data){
    const request = { ...payloadData, status : data }
    const loader = await this.commonUtils.getLoader();
    await loader.present();
    await this.profileService.updateConsent(request).toPromise()
      .then(async (response) => {
        if(message){
          this.commonUtils.showToast(message,'','',9000,'top');
        }else{
          this.commonUtils.showToast('FRMELEMNTS_MSG_DATA_SETTINGS_UPDATE_SUCCESS','','',9000)
        }
        details.consentShared = true
        await loader.dismiss();
        await this.join(details,profileData)
      })
      .catch((e) => {
        data=''
        loader.dismiss();
        if (e.code === 'NETWORK_ERROR') {
          this.commonUtils.showToast('ERROR_NO_INTERNET_MESSAGE');
        }else{
          this.commonUtils.showToast(e.response?.body?.params?.errmsg,'','red-toast','','top');
          this.showConsent(type, payload, details, profileData, message?message:null)
        }
      });
  }
  this.consentStatus.emit(data);
  return data
}

async closeConsent(){
  this.consentPopup ? await this.consentPopup.dismiss() : null
}

  async getConsent(type, payload, details, profileData,message?){
    const request = { userId : this.appGlobalService.getUserId(), ...payload }
    let data:any=''
    await this.profileService.getConsent(request).toPromise().then((response)=>{
      data=response.consents[0]
    }).catch(async (error)=>{
      if (!error.response.body.result.consent && error.response.responseCode === 404) {
        data = await this.showConsent(type, payload, details, profileData,message);
    } else if (error.code === 'NETWORK_ERROR') {
        this.commonUtils.showToast('ERROR_NO_INTERNET_MESSAGE');
    }
    })
    return data
  }

  joinProgram(payloadData,type,message?){
    let programName = payloadData?.programName ? payloadData?.programName : payloadData?.programInformation?.programName 
  return  this.showJoinProgramForProjectPopup("FRMELEMNTS_LBL_JOIN_PROGRAM_POPUP",programName,type,
    "FRMELEMNTS_LBL_JOIN_PROGRAM_POPUP",message).then(
      async (data:any)=>{
        if(data){
          return data;
        }
      }
    )
  }
   async join(payloadData,profileData){
    let programId = payloadData.programId ?payloadData.programId :payloadData?.programInformation?.programId;
    if (profileData) {
      const config = {
        url:`${urlConstants.API_URLS.JOIN_PROGRAM}${programId}`,
        payload: {userRoleInformation:profileData, consentShared:payloadData.consentShared}
      };
      const loader = await this.commonUtils.getLoader();
      await loader.present();
      let response = await this.kendra.post(config).toPromise()
      if(response && response.status == 200){
        loader.dismiss()
        return true
      }else{
        loader.dismiss()
        return false
      }
    }
  }
  

async showConsentPopup(data,profileData){
    if(!data?.requestForPIIConsent){
      let payload = {consumerId: data.rootOrganisations, objectId: data.programId}
       this.showConsent('Program',payload, data,profileData).then(resp =>{
        if(data){
          this.join(true,profileData)
        }
      })
    }
  }

  async closeJoinProgramPopup(){
    this.joinProgramPopup ? await this.joinProgramPopup.dismiss() : null
  }
}