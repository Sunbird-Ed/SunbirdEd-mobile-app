import {Component, Input} from '@angular/core';
import {PopoverController} from '@ionic/angular';
import { PillShape, PillsViewType, PillBorder, ShowMoreViewType, PillsMultiRow, PillSize } from '@project-sunbird/common-consumption';

@Component({
    selector: 'app-sb-subject-list-popup',
    templateUrl: './sb-subject-list-popup.component.html',
    styleUrls: ['./sb-subject-list-popup.component.scss']
})
export class SbSubjectListPopupComponent {
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
        private popoverCtrl: PopoverController
    ) {}

    handlePillSelect(event) {
        if (!event || !event.data || !event.data.length) {
          return;
        }
        this.popoverCtrl.dismiss(event);
    }

    closePopover() {
        this.popoverCtrl.dismiss();
    }
}
