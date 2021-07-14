import { Component, Inject, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { AppThemes, PreferenceKey, SwitchableTabsConfig } from '@app/app/app.constant';
import { SharedPreferences } from 'sunbird-sdk';
import { Events } from '@app/util/events';
import { TelemetryGeneratorService, PageId, InteractSubtype, CommonUtilService } from '@app/services';


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
        private telemetryGeneratorService: TelemetryGeneratorService,
        private commonUtilService: CommonUtilService
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
     this.preference.putString(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG, SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG).toPromise();
     this.popoverCtrl.dismiss();
    }

    async switchToNewTheme() {
        const userType = await this.preference.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
        const isNewUser = await this.preference.getBoolean(PreferenceKey.IS_NEW_USER).toPromise();
        this.telemetryGeneratorService.generateNewExprienceSwitchTelemetry(
            PageId.NEW_EXPERIENCE_POPUP,
            InteractSubtype.OPTED_IN,
            {
                userType,
                isNewUser
            }
        );
        await this.switchToHomeTabs();
        this.preference.putBoolean(PreferenceKey.IS_NEW_USER, false);
        this.commonUtilService.populateGlobalCData();
        this.popoverCtrl.dismiss();
    }

    async switchToHomeTabs() {
       this.preference.putString(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG, SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG).toPromise();
       this.events.publish('UPDATE_TABS');
    }
}
