import {Component, Input, OnInit} from '@angular/core';
import {ContentData, CorrelationData, Rollup, TelemetryObject} from 'sunbird-sdk';
import {CommonUtilService, ID, InteractType, PageId, TelemetryGeneratorService} from '@app/services';

@Component({
    selector: 'app-show-certificate-component',
    templateUrl: './show-certificate-component.component.html',
    styleUrls: ['./show-certificate-component.component.scss'],
})
export class ShowCertificateComponent implements OnInit {
    showCredits = false;

    @Input() content: ContentData;
    @Input() objRollup: Rollup;
    @Input() corRelationList: Array<CorrelationData>;
    @Input() pageId: PageId;
    @Input() certificateDetails: any;
    private objId;
    private objVer;
    private objType;
    showCompletionCertificate = false;
    showMeritCertificate = false;
    meritCertPercent : any ;
    criteria : any;
    constructor(
        private telemetryGeneratorService: TelemetryGeneratorService,
        private commonUtilService: CommonUtilService
    ) {
    }
    ngOnInit() {
        
        this.objId = this.content.identifier;
        this.objType = this.content.contentType;
        this.objVer = this.content.pkgVersion; 
        for(var key in this.certificateDetails) {
            const certCriteria = this.certificateDetails[key]['criteria'];
            if(typeof(certCriteria)== 'string') {
               this.criteria = JSON.parse(certCriteria);  
               this.showCompletionCertificate = this.criteria.enrollment && this.criteria.enrollment.status === 2 ? true : false;     
               this.showMeritCertificate = this.criteria.assessment && this.criteria.assessment.score ? true : false;
               this.meritCertPercent = this.criteria.assessment && this.criteria.assessment.score['>='];
            }
            else if (certCriteria) { 
            this.showCompletionCertificate = certCriteria.enrollment && certCriteria.enrollment.status === 2 ? true : false;     
            this.showMeritCertificate = certCriteria.assessment && certCriteria.assessment.score ? true : false;
            this.meritCertPercent = certCriteria.assessment && certCriteria.assessment.score['>='];
            }
        }
    }

    showCertificate() {
        this.showCredits = !this.showCredits;

        if (this.showCredits) {
            this.certificateSectionClicked('expanded');
        } else {
            this.certificateSectionClicked('collapsed');
        }
    }

    private certificateSectionClicked(params) {
        const telemetryObject = new TelemetryObject(this.objId, this.objType, this.objVer);
        this.telemetryGeneratorService.generateInteractTelemetry(
            params === 'expanded' ? InteractType.CERTIFICATE_CARD_EXPANDED : InteractType.CERTIFICATE_CARD_COLLAPSED,
            '',
            undefined,
            this.pageId,
            telemetryObject,
            undefined,
            this.objRollup,
            this.corRelationList,
            ID.CERTIFICATE_SECTION
        );
    }

}
