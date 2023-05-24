import { Location } from '@angular/common';
import { AppHeaderService } from './../../../services/app-header.service';
import {
    Component, ViewEncapsulation, OnInit, OnDestroy
} from '@angular/core';
import { Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import {
    Environment, ImpressionType, InteractSubtype, InteractType,
    PageId, CorReleationDataType, ID
} from '../../../services/telemetry-constants';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouterLinks } from '../../../app/app.constant';
import { CsGroupAddableBloc } from '@project-sunbird/client-services/blocs';
import { CorrelationData } from '@project-sunbird/sunbird-sdk';


@Component({
    selector: 'add-activity-to-group',
    templateUrl: 'add-activity-to-group.page.html',
    styleUrls: ['./add-activity-to-group.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AddActivityToGroupPage implements OnInit, OnDestroy {

    corRelationList: Array<CorrelationData>;
    unregisterBackButton: Subscription;
    headerObservable: any;
    supportedActivityList: Array<any>;
    groupId: string;
    activityList;
    flattenedActivityList = [];
    private csGroupAddableBloc: CsGroupAddableBloc;

    constructor(
        private router: Router,
        public headerService: AppHeaderService,
        private platform: Platform,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private location: Location,
    ) {
        const extras = this.router.getCurrentNavigation().extras.state;
        if (extras) {
            this.corRelationList = extras.corRelation;
            this.supportedActivityList = extras.supportedActivityList;
            this.groupId = extras.groupId;
            this.activityList = extras.activityList;
        }
        this.csGroupAddableBloc = CsGroupAddableBloc.instance;
    }

    ngOnInit() {
        if (!this.csGroupAddableBloc.initialised) {
            this.csGroupAddableBloc.init();
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
            Environment.GROUP,
            undefined, undefined, undefined, undefined, this.corRelationList);
        this.getflattenedActivityList();
    }

    ionViewWillLeave() {
        this.headerObservable.unsubscribe();
        if (this.unregisterBackButton) {
            this.unregisterBackButton.unsubscribe();
        }
    }

    ngOnDestroy() {
        this.csGroupAddableBloc.dispose();
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

    private getflattenedActivityList() {
        this.flattenedActivityList = [];
        this.activityList.forEach(e => {
            this.flattenedActivityList = [...this.flattenedActivityList, ...e.items];
        });
    }

    async search(data) {
        // Which activity type
        if (!this.corRelationList) {
            this.corRelationList = [];
        }
        const activityTypeCData = this.corRelationList.find(cData => (cData.type === CorReleationDataType.ACTIVITY_TYPE));
        if (activityTypeCData) {
            activityTypeCData.id = data.activityType;
        } else {
            this.corRelationList.push({ id: data.activityType, type: CorReleationDataType.ACTIVITY_TYPE });
        }

        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.SELECT_CATEGORY,
            InteractSubtype.ACTIVITY_TYPE_CLICKED, Environment.GROUP, PageId.ADD_ACTIVITY_TO_GROUP,
            undefined, undefined, undefined, this.corRelationList, ID.SELECT_CATEGORY);

        this.csGroupAddableBloc.updateState({
            pageIds: [],
            groupId: this.groupId,
            params: {
                activityList: this.flattenedActivityList,
                corRelation: this.corRelationList
            }
        });

        await this.router.navigate([RouterLinks.SEARCH], {
            state: {
                activityTypeData: data,
                source: PageId.GROUP_DETAIL,
                groupId: this.groupId,
                activityList: this.flattenedActivityList,
                corRelation: this.corRelationList
            }
        });
    }

}
