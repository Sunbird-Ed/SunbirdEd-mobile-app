import {Component, Input, OnInit} from '@angular/core';
import {ModalController, Platform} from '@ionic/angular';
import {PillShape, PillsViewType, PillBorder, ShowMoreViewType, PillsMultiRow, PillSize, PillTextElipsis} from '@project-sunbird/common-consumption';
import {CorReleationDataType, Environment, ImpressionType, PageId } from '../../../../services/telemetry-constants';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import {CorrelationData} from '@project-sunbird/sunbird-sdk';

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
        private telemetryGeneratorService: TelemetryGeneratorService,
        public platform: Platform
    ) {
    }

    async handlePillSelect(event) {
        if (!event || !event.data || !event.data.length) {
          return;
        }
        await this.modalCtrl.dismiss(event);
    }

    async closePopover() {
        await this.modalCtrl.dismiss();
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
