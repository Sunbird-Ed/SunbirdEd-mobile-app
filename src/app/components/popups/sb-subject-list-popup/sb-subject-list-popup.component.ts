import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {PillShape, PillsViewType, PillBorder, ShowMoreViewType, PillsMultiRow, PillSize, PillTextElipsis} from '@project-sunbird/common-consumption';
import {CorReleationDataType, Environment, ImpressionType, PageId, TelemetryGeneratorService} from '@app/services';
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
    PillTextElipsis = PillTextElipsis;
    ShowMoreViewType = ShowMoreViewType;
    PillSize = PillSize;

    constructor(
        private modalCtrl: ModalController,
        private telemetryGeneratorService: TelemetryGeneratorService
    ) {
    }

    handlePillSelect(event) {
        if (!event || !event.data || !event.data.length) {
          return;
        }
        this.modalCtrl.dismiss(event);
    }

    closePopover() {
        this.modalCtrl.dismiss();
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
