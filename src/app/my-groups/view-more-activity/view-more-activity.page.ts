import { Location } from '@angular/common';
import { AppHeaderService } from '../../../services/app-header.service';
import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Platform} from '@ionic/angular';
import {
    Environment,
    ImpressionType,
    PageId
} from '../../../services/telemetry-constants';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GroupActivity } from '@project-sunbird/sunbird-sdk';
import { ActivitiesGrouped } from '@project-sunbird/client-services/models';
import { CommonUtilService } from '../../../services/common-util.service';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { ViewMoreActivityDelegateService } from './view-more-activity-delegate.page';

@Component({
    selector: 'view-more-activity',
    templateUrl: 'view-more-activity.page.html',
    styleUrls: ['./view-more-activity.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ViewMoreActivityPage implements  OnDestroy {

    unregisterBackButton: Subscription;
    headerObservable: any;
    activityGroup: ActivitiesGrouped;
    groupId: string;
    isMenu: boolean;
    previousPageId?: string;

    constructor(
        public headerService: AppHeaderService,
        public commonUtilService: CommonUtilService,
        private router: Router,
        private platform: Platform,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private location: Location,
        private viewMoreActivityDelegateService: ViewMoreActivityDelegateService
    ) {
        const extras = this.router.getCurrentNavigation().extras.state;
        console.log('extras', extras);
        if (extras) {
            this.activityGroup = extras.activityGroup;
            this.groupId = extras.groupId;
            this.isMenu = extras.isMenu;
            this.previousPageId = extras.previousPageId;
        }
    }


    async ionViewWillEnter() {
        this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
            this.handleHeaderEvents(eventName);
        });
        await this.headerService.showHeaderWithBackButton();
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

    ngOnDestroy() {
        console.log('on destory');
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
        if($event.name === 'back')
        {
            this.handleBackButton(true);
        }
    }

    onActivityCardClick(event, activity: GroupActivity) {
        if (this.viewMoreActivityDelegateService.delegate) {
            this.viewMoreActivityDelegateService.delegate.onViewMoreCardClick(event, activity);
        }
    }

    activityMenuClick(event, activity: GroupActivity, i) {
        if (this.viewMoreActivityDelegateService.delegate) {
            this.viewMoreActivityDelegateService.delegate.onViewMoreCardMenuClick(event, activity).then((isRemoved) => {
                if (isRemoved) {
                    this.activityGroup.items.splice(i, 1);
                }
            }).catch(e => console.error(e));
        }
    }

}
