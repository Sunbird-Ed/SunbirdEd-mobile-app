import { GroupDetailsPageModule } from './../group-details/group-details.module';
import { Location } from '@angular/common';
import { AppHeaderService } from '../../../services/app-header.service';
import { Component, ViewEncapsulation, OnInit, OnDestroy, Injectable } from '@angular/core';
import { Platform} from '@ionic/angular';
import { TelemetryGeneratorService, CommonUtilService } from '@app/services';
import {
    Environment,
    ImpressionSubtype,
    ImpressionType,
    InteractSubtype,
    InteractType,
    PageId
} from '@app/services/telemetry-constants';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GroupActivity } from '@project-sunbird/sunbird-sdk';

@Injectable({ providedIn: GroupDetailsPageModule })
export class ViewMoreActivityDelegateService {
    delegate?: ViewMoreActivityActionsDelegate;
}

export interface ViewMoreActivityActionsDelegate {
    onViewMoreCardClick(event: Event, activity: GroupActivity);
    onViewMoreCardMenuClick(event: Event, activity: GroupActivity): Promise<boolean>;
}

@Component({
    selector: 'view-more-activity',
    templateUrl: 'view-more-activity.page.html',
    styleUrls: ['./view-more-activity.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ViewMoreActivityPage implements OnInit, OnDestroy {

    unregisterBackButton: Subscription;
    headerObservable: any;
    activityGroup: Array<any>;
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

    ngOnInit() {
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

    ngOnDestroy() {
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

    onActivityCardClick(event, activity: GroupActivity) {
        if (this.viewMoreActivityDelegateService.delegate) {
            this.viewMoreActivityDelegateService.delegate.onViewMoreCardClick(event, activity);
        }
    }

    activityMenuClick(event, activity: GroupActivity, i) {
        if (this.viewMoreActivityDelegateService.delegate) {
            this.viewMoreActivityDelegateService.delegate.onViewMoreCardMenuClick(event, activity).then((isRemoved) => {
                if (isRemoved) {
                    this.activityGroup['items'].splice(i, 1);
                }
            });
        }
    }

}
