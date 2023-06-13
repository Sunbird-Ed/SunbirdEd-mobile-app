import { ImpressionSubtype } from './../../services/telemetry-constants';
import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { Notification, UserFeedStatus } from '@project-sunbird/sunbird-sdk';
import {  Subscription } from 'rxjs';

import { AppHeaderService } from '../../services/app-header.service';
import { CommonUtilService } from '../../services/common-util.service';
import { TelemetryGeneratorService } from '../../services/telemetry-generator.service';
import {
  InteractType,
  Environment,
  PageId,
  InteractSubtype,
  ImpressionType
} from '../../services/telemetry-constants';
import { NotificationService } from '../../services/notification.service';
import { Events } from '../../util/events';
import { EventTopics } from '../app.constant';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  notificationList = [] ;
  unreadNotificationList = [];
  private unregisterBackButton: Subscription;
  private headerObservable: Subscription;
  private loader?: any;
  inAppNotificationConfig = { 
    title: 'Notification',
    subTitle: ' New Notification (s)',
    clearText: 'Clear',
    moreText: 'See more',
    lessText: 'See less',
    minNotificationViewCount: 5
  }

  constructor(
    private notificationService: NotificationService,
    private headerService: AppHeaderService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private platform: Platform,
    private location: Location,
    private commonUtilService: CommonUtilService,
    private events: Events
  ) { }

  async ionViewWillEnter() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.NOTIFICATION, Environment.NOTIFICATION, false);
      this.location.back();
    });
    await this.headerService.showHeaderWithBackButton();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
  }

  async ngOnInit() {
    await this.fetchNotificationList();
    this.events.subscribe(EventTopics.NOTIFICATION_REFRESH, async () => {
      await this.fetchNotificationList();
    });
  }

  private async fetchNotificationList() {
    this.loader = await this.commonUtilService.getLoader();
    this.loader.present();
    await this.notificationService.fetchNotificationList().then((data) => {
      this.loader.dismiss();
      this.notificationList = data.feeds;
      console.log('notification list', this.notificationList);
      this.unreadNotificationList = this.notificationList.filter((n: any) => n.status === UserFeedStatus.UNREAD);
      this.inAppNotificationConfig.subTitle = this.unreadNotificationList.length + ' New Notification (s)';
    })
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.PAGE_LOADED,
      ImpressionSubtype.HOME,
      PageId.NOTIFICATION,
      Environment.HOME, '', '', '', undefined
    );
  }


  async clearAllNotifications() {
    if (!this.loader) {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
    }

    const valuesMap = new Map();
    valuesMap['clearAllNotifications'] = true;
    this.generateClickInteractEvent(valuesMap, InteractSubtype.CLEAR_NOTIFICATIONS_CLICKED);

    await this.notificationService.clearAllNotifications();
  }

  async removeNotification(notification: Notification, swipeDirection: string) {
    console.log('removeNotification clicked')
    if (!this.loader) {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
    }

    const valuesMap = new Map();
    valuesMap['deleteNotificationId'] = notification.id;
    valuesMap['swipeDirection'] = swipeDirection;
    this.generateClickInteractEvent(valuesMap, InteractSubtype.CLEAR_NOTIFICATIONS_CLICKED);

    await this.notificationService.deleteNotification({ event: {}, data: notification });
  }

  handleTelemetry(event) {
    this.generateClickInteractEvent(event.valuesMap, event.interactSubType);
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

  ionViewWillLeave() {
    if (this.unregisterBackButton) {
      this.unregisterBackButton.unsubscribe();
    }
    if (this.headerObservable) {
      this.headerObservable.unsubscribe();
    }
    this.events.publish(EventTopics.NOTIFICATION_REFRESH);
  }

  private handleHeaderEvents(event) {
    if(event.name === 'back') 
    {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.NOTIFICATION, Environment.NOTIFICATION, true);
    }
  }

  handleShowLess(event: any) {
    console.log('show less');
  }
  handleShowMore(event: any) {
    console.log('show more');
  }

}
