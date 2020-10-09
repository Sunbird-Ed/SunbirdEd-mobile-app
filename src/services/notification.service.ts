import { Injectable, Inject } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { UtilityService } from './utility-service';
import { ActionType } from '@app/app/app.constant';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { CorrelationData } from '@project-sunbird/sunbird-sdk';
import { CorReleationDataType } from '.';

declare const cordova;

@Injectable()
export class NotificationService {

    private selectedLanguage: string;
    configData: any;
    private appName: any;
    private identifier: any;
    private externalUrl: any;
    private appId: any;
    private _notificationId: string;

    constructor(
        private utilityService: UtilityService,
        private appVersion: AppVersion,
        private localNotifications: LocalNotifications,
        private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate
    ) {
        this.getAppName();
    }

    get notificationId(): string {
        return this._notificationId;
    }

    set notificationId(id) {
        this._notificationId = id;
    }

    setupLocalNotification(language?: string): any {
        if (language) {
            this.selectedLanguage = language;
            this.localNotifications.cancelAll();
        }
        this.utilityService.readFileFromAssets('www/assets/data/local_notofocation_config.json').then(data => {
            this.configData = JSON.parse(data);
            this.localNotifications.getScheduledIds().then((val) => {
                if (this.configData.id !== val[val.length - 1]) {
                    this.setLocalNotification();
                }
            });
        });
    }

    private triggerConfig() {
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

    private setLocalNotification() {
        const trigger = this.triggerConfig();
        const translate = this.configData.data.translations[this.selectedLanguage] || this.configData.data.translations['default'];
        this.localNotifications.schedule({
            id: this.configData.id,
            title: translate.title.replace('{{%s}}', this.appName),
            text: translate.msg.replace('{{%s}}', this.appName),
            icon: 'res://icon',
            smallIcon: 'res://n_icon',
            trigger
        });
    }

    private async getAppName() {
        this.appName = await this.appVersion.getAppName();
    }

    setNotificationDetails(data) {
        switch (data.actionData.actionType) {
            case ActionType.EXT_URL:
                this.externalUrl = data.actionData.deepLink;
                break;
            case ActionType.UPDATE_APP:
                this.utilityService.getBuildConfigValue('APPLICATION_ID')
                .then(value => {
                    this.appId = value;
                });
                break;
            case ActionType.COURSE_UPDATE:
            case ActionType.CONTENT_UPDATE:
            case ActionType.BOOK_UPDATE:
                this.identifier = data.actionData.identifier;
                break;
        }
    }

    async handleNotification() {
        let corRelationList: Array<CorrelationData> = [];
        if (this.notificationId) {
            corRelationList.push({
                id: this.notificationId,
                type: CorReleationDataType.NOTIFICATION_ID
            });
        }
        if (this.identifier) {
            this.splaschreenDeeplinkActionHandlerDelegate.navigateContent(this.identifier, false, null, null, null, corRelationList);
            this.identifier = null;
        } else if (this.appId) {
            await this.utilityService.openPlayStore(this.appId);
            this.appId = null;
        } else if (this.externalUrl) {
            open(this.externalUrl);
            this.externalUrl = null;
        }
        this.notificationId = undefined;
    }


}
