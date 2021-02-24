import { Component, OnInit, Inject } from '@angular/core';
import { Platform, Events } from '@ionic/angular';
import { Location } from '@angular/common';
import { NotificationService, Notification } from 'sunbird-sdk';
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

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  notificationList$: Observable<Notification[]>;
  unreadNotificationList$: Observable<Notification[]>;
  private unregisterBackButton: Subscription;
  private headerObservable: Subscription;
  private loader?: any;

  constructor(
    @Inject('NOTIFICATION_SERVICE') private notificationService: NotificationService,
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

  async ngOnInit() {
    this.loader = await this.commonUtilService.getLoader();
    this.notificationList$ = this.notificationService.notifications$.pipe(
      tap(() => {
        if (this.loader) {
          this.loader.dismiss();
          this.loader = undefined;
        }
      })
    );
    this.unreadNotificationList$ = this.notificationList$.pipe(
      map((notifications) => notifications.filter((n) => !n.isRead))
    );
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.NOTIFICATION,
      Environment.NOTIFICATION, '', '', ''
    );
  }

  async clearAllNotifications() {
    if (!this.loader) {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
    }
    this.notificationService.deleteAllNotifications().toPromise();
    const valuesMap = new Map();
    valuesMap['clearAllNotifications'] = true;
    this.generateClickInteractEvent(valuesMap, InteractSubtype.CLEAR_NOTIFICATIONS_CLICKED);
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
    this.notificationService.deleteNotification(notification).toPromise();
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
    switch (event.name) {
      case 'back':
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.NOTIFICATION, Environment.NOTIFICATION, true);
        break;
    }
  }

}
