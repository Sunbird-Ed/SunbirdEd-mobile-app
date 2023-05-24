import { Location } from '@angular/common';
import { AppHeaderService } from './../../../services/app-header.service';
import { Component, ViewEncapsulation } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import {
    Environment, ImpressionType, InteractSubtype,
    InteractType, PageId
} from '../../../services/telemetry-constants';
import { Router } from '@angular/router';
import { AppGlobalService } from '../../../services/app-global-service.service';
import { Subscription } from 'rxjs';
import { ContentUtil } from '../../../util/content-util';
import { CorrelationData } from '@project-sunbird/sunbird-sdk';

@Component({
    selector: 'activity-toc',
    templateUrl: 'activity-toc.page.html',
    styleUrls: ['./activity-toc.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ActivityTocPage {

    corRelationList: Array<CorrelationData>;
    unregisterBackButton: Subscription;
    headerObservable: any;
    backButtonFunc = undefined;
    courseList: Array<any>;
    mainCourseName: string;
    selectedId;

    constructor(
        private router: Router,
        public headerService: AppHeaderService,
        private platform: Platform,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private location: Location,
        private appGlobalService: AppGlobalService
    ) {
        const extras = this.router.getCurrentNavigation().extras.state;
        if (extras) {
            this.courseList = extras.courseList;
            this.mainCourseName = extras.mainCourseName;
            this.corRelationList = extras.corRelation;
        }
    }

    async ionViewWillEnter() {
        this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
            this.handleHeaderEvents(eventName);
        });
        await this.headerService.showHeaderWithBackButton();
        this.handleDeviceBackButton();
        this.selectedId = this.appGlobalService.selectedActivityCourseId;
        this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.VIEW,
            '', PageId.ACTIVITY_TOC, Environment.GROUP,
            undefined, undefined, undefined, undefined, this.corRelationList);
    }

    ionViewWillLeave() {
        this.headerObservable.unsubscribe();
        if (this.unregisterBackButton) {
            this.unregisterBackButton.unsubscribe();
        }
    }

    handleBackButton(isNavBack: boolean) {
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ACTIVITY_TOC,
            Environment.GROUP, isNavBack, undefined, this.corRelationList);
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

    onCourseChange(course?) {
        if (course) {
            this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
                InteractSubtype.CONTENT_CLICKED, Environment.GROUP, PageId.ACTIVITY_TOC,
                ContentUtil.getTelemetryObject(course),
                undefined,
                ContentUtil.generateRollUp(undefined, course.identifier),
                this.corRelationList);
        }
        this.appGlobalService.selectedActivityCourseId = course ? course.identifier : '';
        this.location.back();
    }

}
