import { Injectable } from '@angular/core';
import { PrivacyPolicyAndTCComponent } from './components/privacy-policy-and-tc/privacy-policy-and-tc.component';
import { PopoverController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class GenericPopUpService {
    constructor(
        private popOverCtrl: PopoverController
    ) { }

    async showPPPForProjectPopUp(message, message1, linkLabel, header, link, type) {
        const alert = await this.popOverCtrl.create({
            component: PrivacyPolicyAndTCComponent,
            componentProps: {
                message: message,
                message1: message1,
                linkLabel: linkLabel,
                header: header,
                link: 'https://diksha.gov.in/term-of-use.html',
                isPrivacyPolicy: type == 'privacyPolicy' ? true : false
            },
            cssClass: 'sb-popover',
        });
        await alert.present();
        const { data } = await alert.onDidDismiss();
        return data;
    }
}