import { Component, Input, Inject, Output, EventEmitter } from '@angular/core';
import { NotificationService } from '@project-sunbird/sunbird-sdk';

import { InteractSubtype } from '../../../services/telemetry-constants';
import {NotificationService as LocalNotification} from '../../../services/notification.service';

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
})
export class NotificationItemComponent {

  isExpanded = false;
  @Output() notificationClick = new EventEmitter();
  @Output() generateNotification = new EventEmitter();
  @Input('itemData') itemData;
  constructor(
      @Inject('NOTIFICATION_SERVICE') private notificationService: NotificationService,
      private notificationDelegate: LocalNotification
  ) {
  }

  toggleExpand() {
    const valuesMap = new Map();
    valuesMap['expandNotification'] = !this.isExpanded;
    this.generateNotification.emit({ valuesMap: valuesMap, interactSubType: InteractSubtype.NOTIFICATION_DESCRIPTION_TOGGLE_EXPAND });

    this.isExpanded = !this.isExpanded;
  }

  async handleDeepLink() {
    const valuesMap = new Map();
    valuesMap['notificationBody'] = this.itemData.actionData;
    if (this.itemData.actionData.deepLink && this.itemData.actionData.deepLink.length) {
      valuesMap['notificationDeepLink'] = this.itemData.actionData.deepLink;
    }
    this.generateNotification.emit({ valuesMap: valuesMap, interactSubType: InteractSubtype.NOTIFICATION_READ });

    this.itemData.isRead = 1;
    this.notificationService.updateNotification(this.itemData).subscribe((status) => {
      this.notificationClick.emit();
    });

    this.notificationDelegate.notificationId = this.itemData.id || '';
    await this.notificationDelegate.setNotificationParams(this.itemData);
    await this.notificationDelegate.handleNotification();
  }
}
