import { Component, Inject, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { AppThemes } from '@app/app/app.constant';


@Component({
    selector: 'app-joyful-theme-popup',
    templateUrl: './joyful-theme-popup.component.html',
    styleUrls: ['./joyful-theme-popup.component.scss']
})
export class JoyfulThemePopupComponent implements OnInit {
    appName = '';
    appTheme = AppThemes.DEFAULT;
    isPopoverPresent = false;
    constructor(
        private popoverCtrl: PopoverController,
        private navParams: NavParams,
    ) {
    }

    ngOnInit() {
        this.appTheme = document.querySelector('html').getAttribute('data-theme');
        this.appName = this.navParams.get('appLabel');
        setTimeout(() => {
            this.isPopoverPresent = true;
        }, 2000);
    }

    closePopover() {
        this.popoverCtrl.dismiss();
    }

    async switchToNewTheme() {
        this.popoverCtrl.dismiss();
    }
}
