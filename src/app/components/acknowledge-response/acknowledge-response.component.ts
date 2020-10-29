import { Component, Output, OnDestroy, EventEmitter, OnInit } from '@angular/core';
import { CommonUtilService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';

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
