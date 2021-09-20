import { CorReleationDataType, ImpressionSubtype } from './../../services/telemetry-constants';
import { Component, Inject, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { Notification, CorrelationData, ProfileService, UserFeedStatus } from 'sunbird-sdk';
import { Observable, Subscription } from 'rxjs';

import { AppHeaderService } from '@app/services/app-header.service';
import { CommonUtilService } from '@app/services/common-util.service';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
  InteractType,
  Environment,
  PageId,
  InteractSubtype,
  ImpressionType
} from '@app/services/telemetry-constants';
import { map, tap } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';
import { NotificationServiceV2 } from '@app/../../sunbird-mobile-sdk/tmp/notification-v2/def/notification-service-v2';
import { ProfileConstants } from '../app.constant';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  // notificationList$: Observable<Notification[]> ;
  // unreadNotificationList$: Observable<Notification[]>;
  notificationList = [] ;
  unreadNotificationList = [];
  private unregisterBackButton: Subscription;
  private headerObservable: Subscription;
  private loader?: any;
  inAppNotificationConfig = { 
    title: 'Notification',
    subTitle: 'New Notification (s)',
    clearText: 'Clear',
    moreText: 'See more',
    lessText: 'See less',
    minNotificationViewCount: 5
  }

  constructor(
    @Inject('NOTIFICATION_SERVICE_V2') private notificationServiceV2: NotificationServiceV2,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private notificationService: NotificationService,
    private headerService: AppHeaderService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private platform: Platform,
    private location: Location,
    private commonUtilService: CommonUtilService,

  ) { }

  ionViewWillEnter() {
    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.NOTIFICATION, Environment.NOTIFICATION, false);
      this.location.back();
    });
    this.headerService.showHeaderWithBackButton();
    this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
      this.handleHeaderEvents(eventName);
    });
  }

  ngOnInit() {
    this.fetchNotificationList();
  }

  private async fetchNotificationList() {

    const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
    this.loader = await this.commonUtilService.getLoader();
    this.notificationServiceV2.notificationRead(profile.uid).subscribe((data) => {
      this.notificationList = data.feeds;
      
      this.unreadNotificationList = this.notificationList.filter((n: any) => n.status === UserFeedStatus.UNREAD);
    })
  }

  // private async fetchNotificationList1() {
  //   this.loader = await this.commonUtilService.getLoader();
  //   this.notificationList$ = (this.notificationService.fetchNotificationList() as any).pipe(
  //     tap(() => {
  //       if (this.loader) {
  //         this.loader.dismiss();
  //         this.loader = undefined;
  //       }
  //     })
  //   );
  //   const corRelationList: Array<CorrelationData> = [];
  //   this.unreadNotificationList$ = this.notificationList$.pipe(
  //     map((notifications) => notifications.filter((n: any) => !n.data.isRead)),
  //       tap((notifications) => {
  //         corRelationList.push(
  //             {id: notifications.length.toString(),
  //               type: CorReleationDataType.NEW_NOTIFICATION});
  //       })
  //   );
  //   this.telemetryGeneratorService.generateImpressionTelemetry(
  //     ImpressionType.PAGE_LOADED,
  //     ImpressionSubtype.HOME,
  //     PageId.NOTIFICATION,
  //     Environment.HOME, '', '', '', undefined,
  //     corRelationList
  //   );
  // }

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
    if (!this.loader) {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
    }

    const valuesMap = new Map();
    valuesMap['deleteNotificationId'] = notification.id;
    valuesMap['swipeDirection'] = swipeDirection;
    this.generateClickInteractEvent(valuesMap, InteractSubtype.CLEAR_NOTIFICATIONS_CLICKED);

    this.notificationService.deleteNotification({ event: {}, data: notification });
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
  }

  private handleHeaderEvents(event) {
    if(event.name === 'back') 
    {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.NOTIFICATION, Environment.NOTIFICATION, true);
    }
  }

}
