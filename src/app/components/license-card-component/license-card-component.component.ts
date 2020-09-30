import {Component, Input, OnInit} from '@angular/core';
import {ContentUtil} from '@app/util/content-util';
import {ContentData, CorrelationData, LicenseDetails, Rollup, TelemetryObject} from 'sunbird-sdk';
import {CommonUtilService, ID, InteractType, PageId, TelemetryGeneratorService} from '@app/services';

@Component({
    selector: 'app-license-card-component',
    templateUrl: './license-card-component.component.html',
    styleUrls: ['./license-card-component.component.scss'],
})
export class LicenseCardComponentComponent implements OnInit {
    showCredits = false;

    @Input() content: ContentData;
    @Input() licenseDetails: LicenseDetails;
    @Input() appName: string;
    @Input() objRollup: Rollup;
    @Input() corRelationList: Array<CorrelationData>;
    @Input() pageId: PageId;
    private objId;
    private objVer;
    private objType;
    constructor(
        private telemetryGeneratorService: TelemetryGeneratorService,
        private commonUtilService: CommonUtilService
    ) {
    }

    ngOnInit() {
        this.objId = this.content.identifier;
        this.objType = this.content.contentType;
        this.objVer = this.content.pkgVersion;
    }

    showLicensce() {
        this.showCredits = !this.showCredits;

        if (this.showCredits) {
            this.licenseSectionClicked('expanded');
        } else {
            this.licenseSectionClicked('collapsed');
        }
    }

    private licenseSectionClicked(params) {
        const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
        this.telemetryGeneratorService.generateInteractTelemetry(
            params === 'expanded' ? InteractType.LICENSE_CARD_EXPANDED : InteractType.LICENSE_CARD_COLLAPSED,
            '',
            undefined,
            this.pageId,
            telemetryObject,
            undefined,
            this.objRollup,
            this.corRelationList,
            ID.LICENSE_CARD_CLICKED
        );
    }

    mergeProperties(mergeProp) {
        return ContentUtil.mergeProperties(this.content, mergeProp);
    }

    openBrowser(url) {
        this.commonUtilService.openUrlInBrowser(url);
    }
}
