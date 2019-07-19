import { Component, OnInit, Inject } from '@angular/core';
import { Platform, Events } from '@ionic/angular';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService, NotificationStatus } from 'sunbird-sdk';
import { Subscription } from 'rxjs';



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

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  notificationList = [];
  newNotificationCount: number = 0;
  showClearNotificationButton: boolean;
  unregisterBackButton: Subscription;

  constructor(
    @Inject('NOTIFICATION_SERVICE') private notificationService: NotificationService,
    private headerService: AppHeaderService,
    public commonUtilService: CommonUtilService,
    private events: Events,
    public telemetryGeneratorService: TelemetryGeneratorService,
    private platform: Platform,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location

  ) {
    this.headerService.hideHeader();
  }

  ionViewWillEnter() {
    this.getNotifications();
    this.events.subscribe('notification:received', () => {
      this.getNotifications();
    });

    this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(11, () => {
      this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.NOTIFICATION, Environment.NOTIFICATION, false);
      this.location.back();
    });
  }


  getNotifications() {
    this.notificationService.getAllNotifications({ notificationStatus: NotificationStatus.ALL }).subscribe((notificationList: any) => {
      this.newNotificationCount = 0;
      this.newNotificationCount = notificationList.filter(item => !item.isRead).length;
      this.notificationList = notificationList;
    });
  }

  ngOnInit() {
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
    this.unregisterBackButton && this.unregisterBackButton.unsubscribe();
  }

  backButton() {
    this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.NOTIFICATION, Environment.NOTIFICATION, true)
  }
}
