import { Inject, Injectable } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { UtilityService } from './utility-service';
import { ActionType } from '@app/app/app.constant';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { CorReleationDataType } from '.';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { CorrelationData, TelemetryService } from '@project-sunbird/sunbird-sdk';
import { Events } from '@ionic/angular';

declare const cordova;

@Injectable()
export class NotificationService {

    private selectedLanguage: string;
    private configData: any;
    private appName: any;
    private identifier: any;
    private externalUrl: any;
    private appId: any;
    private _notificationId: string;
    private contentUrl: string;
    private _notificationPaylod: any;

    constructor(
        @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
        private utilityService: UtilityService,
        private formnFrameworkUtilService: FormAndFrameworkUtilService,
        private appVersion: AppVersion,
        private localNotifications: LocalNotifications,
        private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
        private event: Events
    ) {
        this.getAppName();
    }

    get notificationId(): string {
        return this._notificationId;
    }

    set notificationId(id) {
        this._notificationId = id;
    }
    
    get notificationPayload() {
      return this._notificationPaylod;
    }

    set notificationPayload(payload) {
      this._notificationPaylod = payload;
    }

    setupLocalNotification(language?: string): any {
        if (language) {
            this.selectedLanguage = language;
            this.localNotifications.cancelAll();
        }
        this.formnFrameworkUtilService.getNotificationFormConfig().then(fields => {
            if (fields && fields.length) {
                this.configData = (fields.find(field => field.code === 'localNotification')).config;
                this.configData.forEach(element => {
                    this.localNotifications.getScheduledIds().then((ids) => {
                        if (ids.length) {
                            if (!element.isEnabled && ids.findIndex(ele => ele === element.id) !== -1) {
                                this.localNotifications.cancel(element.id).then(resp => {
                                    console.log('Local Notification Disabled for:' + element.id, resp);
                                });
                            } else if (element.isEnabled && ids.findIndex(ele => ele === element.id) === -1) {
                                this.setLocalNotification(element);
                            }
                        } else {
                            if (element.isEnabled) {
                                this.setLocalNotification(element);
                            }
                        }
                    });
                });
            }
        });
    }

    private triggerConfig(triggerConfig) {
        let tempDate = triggerConfig.start;
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
            if (!isNaN(+triggerConfig.interval) && typeof (+triggerConfig.interval) === 'number') {
                every.day = +triggerConfig.interval;
            } else if (typeof (triggerConfig.interval) === 'string') {
                every[triggerConfig.interval] = +tempDate[0];
            }
            every.hour = hour;
            every.minute = minute;
            trigger.every = every;
        } else if (tempDate.length === 3) {
            trigger.firstAt = new Date(triggerConfig.start);
            trigger.every = triggerConfig.interval;
            if (triggerConfig.occurance) {
                trigger.count = triggerConfig.occurance;
            }
        }
        return trigger;
    }

    private setLocalNotification(triggerConfig) {
        const trigger = this.triggerConfig(triggerConfig);
        const title = JSON.parse(triggerConfig.title);
        const message = JSON.parse(triggerConfig.msg);
        this.localNotifications.schedule({
            id: triggerConfig.id,
            title: title[this.selectedLanguage] || title['en'],
            text:  message[this.selectedLanguage] || message['en'],
            icon: 'res://icon',
            smallIcon: 'res://n_icon',
            trigger
        });
    }

    private async getAppName() {
        this.appName = await this.appVersion.getAppName();
    }

    setNotificationParams(data) {
        this.notificationPayload = data;
        switch (this.notificationPayload.actionData.actionType) {
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
            case ActionType.CONTENT_URL:
                this.contentUrl = data.actionData.contentURL;
                this.telemetryService.updateCampaignParameters([{ type: CorReleationDataType.NOTIFICATION_ID, id: this.notificationId }] as Array<CorrelationData>);
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
        } else if (this.contentUrl) {
            this.splaschreenDeeplinkActionHandlerDelegate.onAction({ url: this.contentUrl }, this);
            this.contentUrl = null;
        } else if (this.notificationPayload && this.notificationPayload.actionData.actionType === ActionType.CERTIFICATE) {
            this.event.publish('to_profile');
        }
        this.notificationId = undefined;
    }


}
