import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { EventTopics } from '../../../app/app.constant';
import { CommonUtilService } from '../../../services/common-util.service';
import {
    Environment,
    ImpressionSubtype,
    ImpressionType,
    InteractSubtype,
    InteractType,
    PageId
} from '../../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service';
import { IonContent, Platform, PopoverController } from '@ionic/angular';
import { Events } from '../../../util/events';
import { AppHeaderService } from './../../../services/app-header.service';
import { SbGenericPopoverComponent } from './../../components/popups/sb-generic-popover/sb-generic-popover.component';
import { TextbookTocService } from './../textbook-toc-service';

@Component({
    selector: 'textbook-toc',
    templateUrl: 'textbook-toc.html',
    styleUrls: ['./textbook-toc.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TextBookTocPage implements OnInit, OnDestroy {

    static pageName = 'TextBookTocPage';

    headerObservable: any;
    backButtonFunc = undefined;
    childrenData: Array<any>;
    activeMimeTypeFilter = ['all'];
    parentId: any;
    showLoading = false;
    isDownloadStarted = false;
    isTextbookTocPage = false;
    stckyUnitTitle?: string;
    @ViewChild(IonContent, { static: false }) content: IonContent;
    stckyindex: any;
    latestParentNodes: any;
    latestParentName: any;
    depth: any;
    corRelationList: any;
    isDepthChild: any;
    breadCrumb: any;
    downloadProgress: any;

    constructor(
        private router: Router,
        public headerService: AppHeaderService,
        private platform: Platform,
        public commonUtilService: CommonUtilService,
        private popoverCtrl: PopoverController,
        private textbookTocService: TextbookTocService,
        private telemetryService: TelemetryGeneratorService,
        private location: Location,
        private events: Events,
    ) {
        const extras = this.router.getCurrentNavigation().extras.state;
        if (extras) {
            this.childrenData = extras.childrenData;
            this.parentId = extras.parentId;
            this.isTextbookTocPage = extras.isTextbookTocPage;
            if (extras.stckyUnitTitle) {
                this.stckyUnitTitle = extras.stckyUnitTitle;
                this.stckyindex = extras.stckyindex;
                this.latestParentNodes = extras.latestParentNodes;
                this.latestParentName =  extras.latestParentNodes ? this.latestParentNodes[this.stckyindex].contentData.name : '';
            }
        }
    }

    ngOnInit() {
        this.getChildDataIdScrollEvent();
    }

    async ionViewWillEnter() {
        this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
            this.handleHeaderEvents(eventName);
        });
        await this.headerService.showHeaderWithBackButton();
        this.backButtonFunc = this.platform.backButton.subscribeWithPriority(11, () => {
            this.handleBackButton(false);
            this.backButtonFunc();
        });
        this.textbookTocService.setTextbookIds({ contentId: undefined, rootUnitId: undefined });
    }

    ionViewWillLeave() {
        this.headerObservable.unsubscribe();
        if (this.backButtonFunc) {
            this.backButtonFunc.unsubscribe();
        }
    }

    handleBackButton(isNavBack: boolean) {
        this.telemetryService.generateBackClickedTelemetry(PageId.TEXTBOOK_TOC, Environment.HOME, isNavBack);
        this.location.back();
    }

    handleHeaderEvents($event) {
        if($event.name == 'back') {
                this.handleBackButton(true);
        }
    }

    async showCommingSoonPopup(childData: any) {
        if (childData.contentData.mimeType === 'application/vnd.ekstep.content-collection' && !childData.children) {
            const popover = await this.popoverCtrl.create({
                component: SbGenericPopoverComponent,
                componentProps: {
                    sbPopoverHeading: this.commonUtilService.translateMessage('CONTENT_COMMING_SOON'),
                    sbPopoverMainTitle: this.commonUtilService.translateMessage('CONTENT_IS_BEEING_ADDED',
                        {content_name : childData.contentData.name }),
                    actionsButtons: [
                        {
                            btntext: this.commonUtilService.translateMessage('OKAY'),
                            btnClass: 'popover-color'
                        }
                    ],
                },
                cssClass: 'sb-popover warning',
            });
            await popover.present();
        }
        this.telemetryService.generateImpressionTelemetry(
            ImpressionType.VIEW,
            ImpressionSubtype.COMINGSOON_POPUP,
            PageId.TEXTBOOK_TOC,
            Environment.HOME,
        );
    }

    // set textbook unit and contentids for scrolling to particular unit in etb page
    setContentId(id: string, content) {
        const values = new Map();
        values['unitClicked'] = id;
        values['parentId'] = this.parentId;
        this.telemetryService.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.UNIT_CLICKED,
            Environment.HOME,
            PageId.TEXTBOOK_TOC,
            undefined,
            values
        );

        this.textbookTocService.setTextbookIds({ rootUnitId: id, contentId: id, content });
        this.location.back();
    }

    getChildDataIdScrollEvent() {
        const headerSpaceHeight = 58;
        const deviceHeight = this.platform.height();
        this.events.subscribe(EventTopics.TOC_COLLECTION_CHILD_ID, (event) => {
            setTimeout(async () => {
                const idVal: any  = document.getElementById(event.id);
                if (idVal) {
                    const offSetIdVal = idVal.offsetTop;
                    if (offSetIdVal && (deviceHeight - headerSpaceHeight) < offSetIdVal) {
                        await this.content.scrollToPoint(0, offSetIdVal, 500);
                    }
                }
            }, 1000);
        });
    }

    ngOnDestroy() {
        this.events.unsubscribe(EventTopics.TOC_COLLECTION_CHILD_ID);
    }

    cancelDownload() {
        console.log('cancel download');
    }
}
