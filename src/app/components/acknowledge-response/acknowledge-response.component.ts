import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonUtilService } from '../../../services/common-util.service';

@Component({
    selector: 'acknowledge-response',
    templateUrl: './acknowledge-response.component.html',
    styleUrls: ['./acknowledge-response.component.scss']
})
export class AcknowledgeResponseComponent implements OnInit, OnDestroy {
    @Output() popupDismiss = new EventEmitter();
    appName = '';
    constructor(
        private commonUtilService: CommonUtilService
    ) {
    }

    async ngOnInit() {
        this.appName = await this.commonUtilService.getAppName();
    }

    ngOnDestroy(): void {
        this.popupDismiss.emit('closed');
    }
}
