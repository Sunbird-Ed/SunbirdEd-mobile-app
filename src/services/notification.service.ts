import { Environment, InteractType, PageId } from './telemetry-constants';
import { Inject, Injectable } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { UtilityService } from './utility-service';
import { ActionType } from '@app/app/app.constant';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { CorReleationDataType, InteractSubtype } from '.';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { CorrelationData, TelemetryService, NotificationService as SdkNotificationService, NotificationStatus, UserFeedStatus } from '@project-sunbird/sunbird-sdk';
import { Events } from '@app/util/events';
import { EventNotification, NotificationFeedEntry, SbNotificationService } from 'notification';
import { BehaviorSubject, Subject } from 'rxjs';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { map } from 'rxjs/operators';
declare const cordova;

@Injectable({
    providedIn: 'root'
})
export class NotificationService implements SbNotificationService {

    private selectedLanguage: string;
    private configData: any;
    private appName: any;
    private identifier: any;
    private externalUrl: any;
    private appId: any;
    private _notificationId: string;
    private contentUrl: string;
    private _notificationPaylod: any;
    notificationList$ = new BehaviorSubject([]);
    showNotificationModel$ = new Subject<boolean>();

    constructor(
        @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
        @Inject('NOTIFICATION_SERVICE') private sdkNotificationService: SdkNotificationService,
        private utilityService: UtilityService,
        private formnFrameworkUtilService: FormAndFrameworkUtilService,
        private appVersion: AppVersion,
        private localNotifications: LocalNotifications,
        private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
        private event: Events,
        private telemetryGeneratorService: TelemetryGeneratorService,
    ) {
        this.getAppName();
    }

    fetchNotificationList() {
        //In mobile fetchNotification is handled from SDK notifications$.
        setTimeout(() => {
            this.sdkNotificationService.getAllNotifications({notificationStatus: NotificationStatus.ALL});
        }, 1000);
        return this.sdkNotificationService.notifications$.pipe(
            map((notifications) => {
                const temp = notifications.map(n => {
                    n['status'] = n['status'] || n.isRead ? UserFeedStatus.READ : UserFeedStatus.UNREAD;
                    n['createdOn'] = n['createdOn'] || n['displayTime'];
                    n.actionData['description'] = n.actionData['description'] || n.actionData['richText'] || n.actionData['ctaText'];
                    n.actionData['thumbnail'] = n.actionData['thumbnail'] || n.actionData['appIcon'];
                    return { data: n };
                });
                return temp as any;
            })
        ) as any;
    }

    async handleNotificationClick(notificationData: EventNotification): Promise<void> {
        if (!notificationData || !notificationData.data || !notificationData.data.data) {
            return;
        }
        const notification = notificationData.data.data;
        const valuesMap = new Map();
        valuesMap['notificationBody'] = notification.actionData;
        if (notification.actionData.deepLink && notification.actionData.deepLink.length) {
            valuesMap['notificationDeepLink'] = notification.actionData.deepLink;
        }
        this.generateClickInteractEvent(valuesMap, InteractSubtype.NOTIFICATION_READ);

        notification.isRead = 1;
        await this.sdkNotificationService.updateNotification(notification).toPromise();

        this.notificationId = notification.id || '';
        this.setNotificationParams(notification);
        this.handleNotification();
    }

    async deleteNotification(notificationData: EventNotification): Promise<boolean> {
        try {
            await this.sdkNotificationService.deleteNotification(notificationData.data.data).toPromise();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async clearAllNotifications(notificationListData?: EventNotification): Promise<boolean> {
        try {
            await this.sdkNotificationService.deleteAllNotifications().toPromise();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
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

    setupLocalNotification(language?: string, payLoad?: any): any {
        if (language) {
            this.selectedLanguage = language;
            this.localNotifications.cancelAll();
        }
        if (payLoad) {
            this.setTrigerConfig(payLoad);
        } else {
            this.formnFrameworkUtilService.getNotificationFormConfig().then(fields => {
                this.setTrigerConfig(fields);
            });
        }
    }

    setTrigerConfig(fields) {
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
        try {
            const trigger = this.triggerConfig(triggerConfig);
            const title = JSON.parse(triggerConfig.title);
            const message = JSON.parse(triggerConfig.msg);
            this.localNotifications.schedule({
                id: triggerConfig.id,
                title: title[this.selectedLanguage] || title['en'],
                text: message[this.selectedLanguage] || message['en'],
                icon: 'res://icon',
                smallIcon: 'res://n_icon',
                trigger
            });
        } catch (e) {
            console.log('Error', e);
        }
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

    private generateClickInteractEvent(valuesMap, interactSubType) {
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.TOUCH,
            interactSubType,
            Environment.NOTIFICATION,
            PageId.NOTIFICATION,
            undefined,
            valuesMap
        );
    }

}
