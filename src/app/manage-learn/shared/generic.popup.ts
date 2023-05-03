import { Injectable } from '@angular/core';
import { PrivacyPolicyAndTCComponent } from './components/privacy-policy-and-tc/privacy-policy-and-tc.component';
import { PopoverController } from '@ionic/angular';
import { SbGenericPopoverComponent } from '@app/app/components/popups/sb-generic-popover/sb-generic-popover.component';
import { CommonUtilService } from '@app/services/common-util.service';
import { StartImprovementComponent } from './components/start-improvement/start-improvement.component';

@Injectable({
  providedIn: 'root',
})
export class GenericPopUpService {
  constructor(private popOverCtrl: PopoverController, private commonUtils: CommonUtilService) {}

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

  async showStartIMPForProjectPopUp(header,message, message1, ) {
    const alert = await this.popOverCtrl.create({
        component: StartImprovementComponent,
        componentProps: {
            message: message,
            message1: message1,
            header: header,
        },
        cssClass: 'sb-popover',
    });
    await alert.present();
    const { data } = await alert.onDidDismiss();
    return data;
}
}