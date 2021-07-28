import { Location } from '@angular/common';
import { AppHeaderService } from './../../../services/app-header.service';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { Environment, PageId } from '@app/services/telemetry-constants';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GroupService } from '@project-sunbird/sunbird-sdk';
import { CommonUtilService } from '@app/services';

@Component({
    selector: 'activity-dashboard',
    templateUrl: './activity-dashboard.page.html',
    styleUrls: ['./activity-dashboard.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ActivityDashboardPage {

    // corRelationList: Array<CorrelationData>;
    unregisterBackButton: Subscription;
    headerObservable: any;
    backButtonFunc = undefined;
    hierarchyData: any;
    aggData: any;
    dashletData: any;
    activity: any;
    lastUpdatedOn: any;
    collectionName: string;

    constructor(
        @Inject('GROUP_SERVICE') public groupService: GroupService,
        private router: Router,
        public headerService: AppHeaderService,
        private platform: Platform,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private location: Location,
        public commonUtilService: CommonUtilService
    ) {
        const extras = this.router.getCurrentNavigation().extras.state;
        if (extras) {
            this.hierarchyData = extras.hierarchyData;
            this.aggData = extras.aggData;
            this.activity = extras.activity;
            this.lastUpdatedOn = extras.lastUpdatedOn;
            this.collectionName = extras.collectionName;
            console.log('lastUpdatedOn', this.lastUpdatedOn)
        }
    }

    ionViewWillEnter() {
        this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
            this.handleHeaderEvents(eventName);
        });
        this.headerService.showHeaderWithBackButton();
        this.handleDeviceBackButton();
        this.groupService.activityService.getDataForDashlets(this.hierarchyData.children, this.aggData).subscribe((data) => {
            console.log('getDataForDashlets data', data);
            this.dashletData = data;
        })
    }

    ionViewWillLeave() {
        this.headerObservable.unsubscribe();
        if (this.unregisterBackButton) {
            this.unregisterBackButton.unsubscribe();
        }
    }

    handleBackButton(isNavBack: boolean) {
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ACTIVITY_TOC,
            Environment.GROUP, isNavBack);
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

}
