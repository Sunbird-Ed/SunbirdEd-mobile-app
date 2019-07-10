import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Platform, NavController, NavParams, Events } from '@ionic/angular';
import { NotificationService, NotificationStatus } from 'sunbird-sdk';
import { Location } from '@angular/common';

import {
  AppHeaderService,
  CommonUtilService,
  TelemetryGeneratorService,
  InteractType,
  Environment,
  PageId,
  InteractSubtype,
  ImpressionType
} from '@app/services';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  notificationList = [];
  newNotificationCount: number = 0;
  showClearNotificationButton: boolean;

  constructor(
    private headerService: AppHeaderService,
    private commonUtilService: CommonUtilService,
    @Inject('NOTIFICATION_SERVICE') private notificationService: NotificationService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private platform: Platform,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location

  ) {
    this.headerService.hideHeader();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getNotifications();
    this.events.subscribe('notification:received', () => {
      this.getNotifications();
    });

    this.platform.backButton.subscribeWithPriority(11, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.NOTIFICATION, Environment.NOTIFICATION, false);
      // this.navCtrl.pop();
      this.location.back();
      window.history.back();
    });
  }


  getNotifications() {
    this.notificationService.getAllNotifications({ notificationStatus: NotificationStatus.ALL }).subscribe((notificationList: any) => {
      this.newNotificationCount = 0;
      this.newNotificationCount = notificationList.filter(item => !item.isRead).length;
      this.notificationList = notificationList;
    });
  }

  ionViewDidLoad() {
    // this.navBar.backButtonClick = () => {
    //   this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.NOTIFICATION, Environment.NOTIFICATION, true);
    //   // this.navCtrl.pop();
    // };
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.NOTIFICATION,
      Environment.NOTIFICATION, '', '', ''
    );
  }

  clearAllNotifications() {
    this.notificationService.deleteNotification().subscribe((status) => {
      this.notificationList = [];
      this.newNotificationCount = 0;
      this.events.publish('notification-status:update', { isUnreadNotifications: false });
    });

    const valuesMap = new Map();
    valuesMap['clearAllNotifications'] = true;
    this.generateClickInteractEvent(valuesMap, InteractSubtype.CLEAR_NOTIFICATIONS_CLICKED);
  }

  removeNotification(index: number, swipeDirection: string) {
    const valuesMap = new Map();
    valuesMap['deleteNotificationId'] = this.notificationList[index].id;
    valuesMap['swipeDirection'] = swipeDirection;
    this.generateClickInteractEvent(valuesMap, InteractSubtype.CLEAR_NOTIFICATIONS_CLICKED);

    this.notificationService.deleteNotification(this.notificationList[index].id).subscribe((status) => {
      if (!this.notificationList[index].isRead) {
        this.updateNotificationCount();
      }
      this.notificationList.splice(index, 1);
    });
  }

  updateNotificationCount(event?) {
    if (this.newNotificationCount > 0) {
      if (this.newNotificationCount === 1) {
        this.events.publish('notification-status:update', { isUnreadNotifications: false });
      }
      this.newNotificationCount--;
    }
  }

  handleTelemetry(event) {
    this.generateClickInteractEvent(event.valuesMap, event.interactSubType);
  }

  generateClickInteractEvent(valuesMap, interactSubType) {
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
    this.platform.backButton.unsubscribe();
  }
}
