import { Component, Output, OnDestroy, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'acknowledge-response',
    templateUrl: './acknowledge-response.component.html',
    styleUrls: ['./acknowledge-response.component.scss']
})
export class AcknowledgeResponseComponent implements OnDestroy{
    @Output() popupDismiss = new EventEmitter();
    constructor(
        private translate: TranslateService,
    ) {}

    ngOnDestroy(): void {
        this.popupDismiss.emit('closed');
    }

    
}