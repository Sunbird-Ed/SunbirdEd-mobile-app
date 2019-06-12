import { Injectable, Inject } from '@angular/core';
import { TelemetryGeneratorService } from '.';
import { File } from '@ionic-native/file/ngx';
import { ProfileService, SharedPreferences } from 'sunbird-sdk';
import { TranslateService } from '@ngx-translate/core';
import { AppVersion } from '@ionic-native/app-version/ngx';

declare const cordova;

@Injectable()
export class NotificationService {

    selectedLanguage: string;
    configData: any;
    appName: any;

    constructor(
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private file: File,
        private translate: TranslateService,
        private appVersion: AppVersion
    ) {
        this.getAppName();
    }

    setupLocalNotification(language?: string): any {
        if (language) {
            this.selectedLanguage = language;
            cordova.plugins.notification.local.cancelAll();
        }
        this.file.readAsText(this.file.applicationDirectory + 'www/assets/data', 'local_notofocation_config.json').then(data => {
            this.configData = JSON.parse(data);
            cordova.plugins.notification.local.getScheduledIds((val) => {
                if (this.configData.id !== val[val.length - 1]) {
                    this.setLocalNotification();
                }
            });
        });
    }

    triggerConfig() {
        let tempDate = this.configData.data.start;
        tempDate = tempDate.split(' ');
        const hour = +tempDate[1].split(':')[0];
        const minute = +tempDate[1].split(':')[1];
        tempDate = tempDate[0].split('/');
        const trigger: any = {};


        if (tempDate.length === 1) {
            const every: any = {
                minute: '',
                hour: ''
            };
            if (!isNaN(+this.configData.data.interval) && typeof (+this.configData.data.interval) === 'number') {
                every.day = +this.configData.data.interval;
            } else if (typeof (this.configData.data.interval) === 'string') {
                every[this.configData.data.interval] = +tempDate[0];
            }
            every.hour = hour;
            every.minute = minute;
            trigger.every = every;
        } else if (tempDate.length === 3) {
            trigger.firstAt = new Date(this.configData.data.start);
            trigger.every = this.configData.data.interval;
            if (this.configData.data.occurance) {
                trigger.count = this.configData.data.occurance;
            }
        }
        return trigger;
    }

    setLocalNotification() {
        const trigger = this.triggerConfig();
        const translate = this.configData.data.translations[this.selectedLanguage] || this.configData.data.translations['default'];
        cordova.plugins.notification.local.schedule({
            id: this.configData.id,
            title: translate.title.replace('{{%s}}', this.appName),
            text: translate.msg.replace('{{%s}}', this.appName),
            icon: 'res://icon',
            smallIcon: 'res://n_icon',
            trigger: trigger
        });
    }

    getAppName() {
        this.appVersion.getAppName()
            .then((appName: any) => {
                this.appName = appName;
            });
    }


}
