import { Component, Inject, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { AppThemes, PreferenceKey, SwitchableTabsConfig } from '@app/app/app.constant';
import { SharedPreferences } from 'sunbird-sdk';
import { Events } from '@app/util/events';


@Component({
    selector: 'app-new-experience-popup',
    templateUrl: './new-experience-popup.component.html',
    styleUrls: ['./new-experience-popup.component.scss']
})
export class NewExperiencePopupComponent implements OnInit {
    appName = '';
    appTheme = AppThemes.DEFAULT;
    isPopoverPresent = false;
    constructor(
        @Inject('SHARED_PREFERENCES') private preference: SharedPreferences,
        private popoverCtrl: PopoverController,
        private navParams: NavParams,
        private events: Events,
    ) {
    }

    ngOnInit() {
        this.appTheme = document.querySelector('html').getAttribute('data-theme');
        this.appName = this.navParams.get('appLabel').toUpperCase();
        setTimeout(() => {
            this.isPopoverPresent = true;
        }, 2000);
    }

    async closePopover() {
        this.popoverCtrl.dismiss();
    }

    async switchToNewTheme() {
        await this.switchToHomeTabs();
        this.popoverCtrl.dismiss();
    }

    async switchToHomeTabs() {
       this.preference.putString(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG, SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG).toPromise();
       this.events.publish('UPDATE_TABS');
    }
}
