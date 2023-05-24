import { Component, Inject, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { AppThemes } from '../../../../app/app.constant';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { AppHeaderService } from '../../../../services/app-header.service';


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
        @Inject('SHARED_PREFERENCES') private preference: SharedPreferences,
        private popoverCtrl: PopoverController,
        private navParams: NavParams,
        private appHeaderService: AppHeaderService
    ) {
    }

    ngOnInit() {
        this.appTheme = document.querySelector('html').getAttribute('data-theme');
        this.appName = this.navParams.get('appLabel');
        setTimeout(() => {
            this.isPopoverPresent = true;
        }, 2000);
    }

    async closePopover() {
        await this.switchToJoyfulTheme();
        await this.popoverCtrl.dismiss();
    }

    async switchToNewTheme() {
        await this.switchToJoyfulTheme();
        await this.popoverCtrl.dismiss();
    }

    async switchToJoyfulTheme() {
        if (document.querySelector('html').getAttribute('data-theme') === AppThemes.DEFAULT) {
            this.appTheme = AppThemes.JOYFUL;
            await this.preference.putString('current_selected_theme', this.appTheme).toPromise();
            await this.appHeaderService.showStatusBar().then();
        }
    }
}
