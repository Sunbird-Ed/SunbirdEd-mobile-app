import { Component, Inject, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { AppThemes, PreferenceKey, SwitchableTabsConfig } from '../../../../app/app.constant';
import { SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { Events } from '../../../../util/events';
import { PageId, InteractSubtype } from '../../../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import { CommonUtilService } from '../../../../services/common-util.service';

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
        const userType = await this.preference.getString(PreferenceKey.SELECTED_USER_TYPE).toPromise();
        const isNewUser = await this.preference.getBoolean(PreferenceKey.IS_NEW_USER).toPromise();
        this.telemetryGeneratorService.generateNewExprienceSwitchTelemetry(
            PageId.NEW_EXPERIENCE_POPUP,
            InteractSubtype.CANCEL_CLICKED,
            {
                userType,
                isNewUser
            }
        );
        await this.preference.putString(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG,
            SwitchableTabsConfig.RESOURCE_COURSE_TABS_CONFIG).toPromise();
        await this.popoverCtrl.dismiss();
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
        await this.commonUtilService.populateGlobalCData();
        await this.popoverCtrl.dismiss();
    }

    async switchToHomeTabs() {
        await this.preference.putString(PreferenceKey.SELECTED_SWITCHABLE_TABS_CONFIG,
            SwitchableTabsConfig.HOME_DISCOVER_TABS_CONFIG).toPromise();
        this.events.publish('UPDATE_TABS');
    }
}
