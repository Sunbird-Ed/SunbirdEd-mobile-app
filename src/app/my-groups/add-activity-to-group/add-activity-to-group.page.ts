import { Location } from '@angular/common';
import { AppHeaderService } from './../../../services/app-header.service';
import { Component, ViewEncapsulation } from '@angular/core';
import { Platform} from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
    Environment,
    ImpressionSubtype,
    ImpressionType,
    InteractSubtype,
    InteractType,
    PageId
} from '@app/services/telemetry-constants';
import { Router } from '@angular/router';
import { AppGlobalService } from '@app/services';
import { Subscription } from 'rxjs';
import { ContentUtil } from '@app/util/content-util';
import { RouterLinks } from '@app/app/app.constant';


@Component({
    selector: 'add-activity-to-group',
    templateUrl: 'add-activity-to-group.page.html',
    styleUrls: ['./add-activity-to-group.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AddActivityToGroupPage {

    unregisterBackButton: Subscription;
    headerObservable: any;
    supportedActivityList: Array<any>;
    groupId: string;
    activityList;

    constructor(
        private router: Router,
        public headerService: AppHeaderService,
        private platform: Platform,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private location: Location,
    ) {
        const extras = this.router.getCurrentNavigation().extras.state;
        if (extras) {
            this.supportedActivityList = extras.supportedActivityList;
            this.groupId = extras.groupId;
            this.activityList = extras.activityList;
        }
    }

    ionViewWillEnter() {
        this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
            this.handleHeaderEvents(eventName);
        });
        this.headerService.showHeaderWithBackButton();
        this.handleDeviceBackButton();
        this.telemetryGeneratorService.generateImpressionTelemetry(
            ImpressionType.VIEW,
            '',
            PageId.ADD_ACTIVITY_TO_GROUP,
            Environment.GROUP
        );
    }

    ionViewWillLeave() {
        this.headerObservable.unsubscribe();
        if (this.unregisterBackButton) {
            this.unregisterBackButton.unsubscribe();
        }
    }

    handleBackButton(isNavBack: boolean) {
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ACTIVITY_TOC, Environment.GROUP, isNavBack);
        this.location.back();
    }

    handleDeviceBackButton() {
        this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
          this.handleBackButton(false);
        });
    }

    handleHeaderEvents($event) {
        switch ($event.name) {
            case 'back':
                this.handleBackButton(true);
                break;
        }
    }

    async search(data) {
        this.router.navigate([RouterLinks.SEARCH], {
          state: {
            activityTypeData: data,
            source: PageId.GROUP_DETAIL,
            groupId: this.groupId,
            activityList: this.activityList
          }
        });
      }

}
