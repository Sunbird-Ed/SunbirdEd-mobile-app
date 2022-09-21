import { Environment, InteractType, PageId } from './telemetry-constants';
import { Inject, Injectable } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { UtilityService } from './utility-service';
import { ActionType, EventTopics, ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { SplaschreenDeeplinkActionHandlerDelegate } from './sunbird-splashscreen/splaschreen-deeplink-action-handler-delegate';
import { CorReleationDataType, InteractSubtype } from '.';
import { FormAndFrameworkUtilService } from './formandframeworkutil.service';
import { CorrelationData, TelemetryService, GetByIdRequest, CachedItemRequestSourceFrom, GroupService, ProfileService, ContentSearchCriteria, ContentService } from '@project-sunbird/sunbird-sdk';
import { Events } from '@app/util/events';
import { EventNotification, SbNotificationService } from 'sb-notification';
import { BehaviorSubject, Subject } from 'rxjs';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { NotificationServiceV2 } from '@project-sunbird/sunbird-sdk/notification-v2/def/notification-service-v2';
import { NavigationExtras, Router } from '@angular/router';
import { NavigationService } from './navigation-handler.service';
import { CommonUtilService } from './common-util.service';
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
    notificationData: any;

    constructor(
        @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
        @Inject('NOTIFICATION_SERVICE_V2') private notificationServiceV2: NotificationServiceV2,
        @Inject('GROUP_SERVICE') public groupService: GroupService,
        @Inject('PROFILE_SERVICE') private profileService: ProfileService,
        @Inject('CONTENT_SERVICE') private contentService: ContentService,
        private utilityService: UtilityService,
        private formnFrameworkUtilService: FormAndFrameworkUtilService,
        private appVersion: AppVersion,
        private localNotifications: LocalNotifications,
        private splaschreenDeeplinkActionHandlerDelegate: SplaschreenDeeplinkActionHandlerDelegate,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private router: Router,
        private events: Events,
        private navService: NavigationService,
        private commonUtilService: CommonUtilService
    ) {
        this.getAppName();
    }

    async fetchNotificationList() {
        const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
        return this.notificationServiceV2.notificationRead(profile.uid).toPromise()
    }

    async handleNotificationClick(notificationData: EventNotification): Promise<void> {
        console.log('service handleNotificationClick', notificationData)
        this.updateNotification(notificationData.data);
        if (!notificationData || !notificationData.data || !notificationData.data.action) {
            return;
        }
        this.notificationData = notificationData.data;

        this.notificationData.isRead = 1;

        this.notificationId = this.notificationData.id || '';
        this.setNotificationParams(this.notificationData);
        this.handleNotification();
    }

    async deleteNotification(notificationData): Promise<boolean> {
        console.log('service deleteNotification', notificationData)
        const req: any = {
            ids: [notificationData.data.id],
            userId: notificationData.data.userId,
            category: notificationData.data.action.category
        }
        try {
            await this.notificationServiceV2.notificationDelete(req).toPromise();
            this.events.publish(EventTopics.NOTIFICATION_REFRESH);
            return true;
        } catch (e) {
            this.commonUtilService.showToast('SOMETHING_WENT_WRONG')
            return false;
        }
    }

    async clearAllNotifications(notificationListData?: EventNotification): Promise<boolean> {
        const ids = [];
        notificationListData.data.forEach(element => {
            ids.push(element.id)
        });
        const req: any = {
            ids: ids,
            userId: notificationListData.data[0].userId,
            category: notificationListData.data[0].action.category
        }
        try {
            await this.notificationServiceV2.notificationDelete(req).toPromise();
            this.events.publish(EventTopics.NOTIFICATION_REFRESH);
            return true;
        } catch (e) {
            this.commonUtilService.showToast('SOMETHING_WENT_WRONG')
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
            let title;
            let message;
            try {
                title = JSON.parse(triggerConfig.title);
                message = JSON.parse(triggerConfig.msg);
            } catch (e) {
                title = triggerConfig.title;
                message = triggerConfig.msg;
                console.log('Not a JSON valid string');
            }
            if (triggerConfig.start) {
                const trigger = this.triggerConfig(triggerConfig);
                this.localNotifications.schedule({
                    id: triggerConfig.id,
                    title: title[this.selectedLanguage] || title['en'],
                    text: message[this.selectedLanguage] || message['en'],
                    icon: 'res://icon',
                    smallIcon: 'res://n_icon',
                    trigger
                });
            } else {
                this.localNotifications.schedule({
                    id: triggerConfig.id,
                    title: triggerConfig.title,
                    text: triggerConfig.msg,
                    foreground: true
                });
            }
        } catch (e) {
            console.log('Error', e);
        }
    }

    private async getAppName() {
        this.appName = await this.appVersion.getAppName();
    }

    setNotificationParams(data) {
        this.notificationPayload = data;
        let type;
        let actionData;
        if (this.notificationPayload.actionData && this.notificationPayload.actionData.actionType) {
            type = this.notificationPayload.actionData.actionType;
            actionData = this.notificationPayload.actionData;
        } else if (this.notificationPayload.action && this.notificationPayload.action.type) {
            type = this.notificationPayload.action.type;
            actionData = this.notificationPayload.action.additionalInfo;
        }
        switch (type) {
            case ActionType.EXT_URL:
                this.externalUrl = actionData.deepLink;
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
                this.identifier = actionData.identifier;
                break;
            case ActionType.CONTENT_URL:
                this.contentUrl = actionData.contentURL;
                this.telemetryService.updateCampaignParameters([{
                    type: CorReleationDataType.NOTIFICATION_ID,
                    id: this.notificationId
                }] as Array<CorrelationData>);
                break;
            case ActionType.SEARCH:
                const searchFilters = actionData.options;
                (searchFilters['searchCriteria'] as ContentSearchCriteria) =
                this.contentService.formatSearchCriteria({ request: searchFilters.filter });
                searchFilters['facet'] = searchFilters.facets || '';
                const params = {
                    formField: searchFilters,
                    fromLibrary: false
                };
                this.router.navigate([RouterLinks.CATEGORY_LIST], { state: params });
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
        const valuesMap = corRelationList;
        valuesMap['notificationBody'] = this.notificationData.action;
        if (this.notificationData.action.deepLink && this.notificationData.action.deepLink.length) {
            valuesMap['notificationDeepLink'] = this.notificationData.action.deepLink;
        }
        this.generateClickInteractEvent(valuesMap, InteractSubtype.NOTIFICATION_READ);
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
        } else if (this.notificationPayload && this.notificationPayload.action
            && this.notificationPayload.action.type === ActionType.CERTIFICATE) {
            console.log('ActionType.CERTIFICATE clicked')
            this.events.publish('to_profile');
        }
        this.notificationId = undefined;
    }

    private generateClickInteractEvent(valuesMap, interactSubType) {     
        const correlationData = valuesMap[0]? [valuesMap[0]]:undefined;
        this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.TOUCH,
            interactSubType,
            Environment.NOTIFICATION,
            PageId.NOTIFICATION,
            undefined,
            valuesMap,
            undefined,
            correlationData
             );
    }

    updateNotification(notificationData) {
        const req = {
            ids: [notificationData.id],
            userId: notificationData.userId
        }
        this.notificationServiceV2.notificationUpdate(req).toPromise()
        .then((resp) => {
            this.events.publish(EventTopics.NOTIFICATION_REFRESH);
        }).catch((err) => {
            console.log('err', err)
        });
        this.redirectNotification(notificationData)
    }

    redirectNotification(notificationData) {
        if(notificationData.action.additionalInfo.group) {
            if (notificationData.action.type === 'group-activity-removed' ||
                notificationData.action.type === 'member-added') 
            {
                const navigationExtras: NavigationExtras = {
                    state: {
                        groupId: notificationData.action.additionalInfo.group.id
                    }
                };
                this.router.navigate([`/${RouterLinks.MY_GROUPS}/${RouterLinks.MY_GROUP_DETAILS}`], navigationExtras);
            } 
            else if (notificationData.action.type === 'group-activity-added') {
                this.redirectToActivityDetails(notificationData)
            }
        }
    }

    private async redirectToActivityDetails(notificationData){
        const getByIdRequest: GetByIdRequest = {
            from: CachedItemRequestSourceFrom.SERVER,
            id: notificationData.action.additionalInfo.group.id,
            userId: notificationData.userId,
            options: {
                includeMembers: true,
                includeActivities: true,
                groupActivities: true
            }
        };
        try {
        const groupDetails = await this.groupService.getById(getByIdRequest).toPromise();
        const activity = groupDetails.activitiesGrouped.find((g) => g.title === notificationData.action.additionalInfo.activity.type)
                         .items.find((a) => a.id === notificationData.action.additionalInfo.activity.id).activityInfo
        this.navService.navigateToDetailPage(activity, {
        content: activity,
        activityData: {
            group: groupDetails,
            isGroupCreatorOrAdmin: notificationData.action.additionalInfo.groupRole == 'admin',
            activity
        },
        corRelation: undefined,
        });
        } catch (e) { 
            console.log(e);
        }
    }

}