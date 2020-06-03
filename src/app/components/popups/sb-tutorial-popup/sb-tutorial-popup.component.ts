import {Component, OnInit} from '@angular/core';
import {NavParams, PopoverController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-sb-tutorial-popup',
    templateUrl: './sb-tutorial-popup.component.html',
    styleUrls: ['./sb-tutorial-popup.component.scss']
})
export class SbTutorialPopupComponent implements OnInit {
    appName = '';
    isPopoverPresent = false;
    explainVideos;
    quesBanks;
    interactiveMaterial;
    constructor(
        private popoverCtrl: PopoverController,
        private navParams: NavParams,
        private translate: TranslateService
    ) {
        this.explainVideos = '<strong class="bold">' + this.translateMessage('EXP_VIDEOS') + '</strong>';
        this.quesBanks = '<strong class="bold">' + this.translateMessage('QUES_BANKS') + '</strong>';
        this.interactiveMaterial = '<strong class="bold">' + this.translateMessage('INTERACTIVE_MATERIAL') + '</strong>';
    }

    ngOnInit() {
        this.appName = this.navParams.get('appLabel');

        setTimeout(() => {
            this.isPopoverPresent = true;
        }, 2000);
    }

    closePopover(continueClicked: boolean) {
        this.popoverCtrl.dismiss({continueClicked});
    }

    private translateMessage(messageConst: string, fields?: string | any): string {
        let translatedMsg = '';
        let replaceObject: any = '';

        if (typeof (fields) === 'object') {
            replaceObject = fields;
        } else {
            replaceObject = { '%s': fields };
        }

        this.translate.get(messageConst, replaceObject).subscribe(
            (value: any) => {
                translatedMsg = value;
            }
        );
        return translatedMsg;
    }
}
