import {Component, Input, OnInit} from '@angular/core';
import {PopoverController} from '@ionic/angular';
import {PillShape, PillsViewType, PillBorder, ShowMoreViewType, PillsMultiRow, PillSize} from '@project-sunbird/common-consumption';
import {CorReleationDataType, Environment, ImpressionType, InteractType, PageId, TelemetryGeneratorService} from '@app/services';
import {CorrelationData} from 'sunbird-sdk';

@Component({
    selector: 'app-sb-subject-list-popup',
    templateUrl: './sb-subject-list-popup.component.html',
    styleUrls: ['./sb-subject-list-popup.component.scss']
})
export class SbSubjectListPopupComponent implements OnInit {
    @Input() public subjectList = [];
    @Input() public title = '';
    @Input() public theme;

    PillShape = PillShape;
    PillsViewType = PillsViewType;
    PillBorder = PillBorder;
    PillsMultiRow = PillsMultiRow;
    ShowMoreViewType = ShowMoreViewType;
    PillSize = PillSize;

    constructor(
        private popoverCtrl: PopoverController,
        private telemetryGeneratorService: TelemetryGeneratorService
    ) {
    }

    handlePillSelect(event) {
        if (!event || !event.data || !event.data.length) {
          return;
        }
        this.popoverCtrl.dismiss(event);
    }

    closePopover() {
        this.popoverCtrl.dismiss();
    }

    ngOnInit(): void {
        const corRelationList: Array<CorrelationData> = [];
        corRelationList.push({id: this.subjectList.toString(), type: CorReleationDataType.SUBJECT_LIST});
        this.telemetryGeneratorService.generateImpressionTelemetry(
            ImpressionType.POP_UP_CATEGORY,
            '',
            Environment.HOME,
            PageId.HOME,
            undefined, undefined, undefined, undefined,
            corRelationList
        );
    }
}
