import { Component, Output, OnDestroy, EventEmitter } from '@angular/core';

@Component({
    selector: 'acknowledge-response',
    templateUrl: './acknowledge-response.component.html',
    styleUrls: ['./acknowledge-response.component.scss']
})
export class AcknowledgeResponseComponent implements OnDestroy{
    @Output() popupDismiss = new EventEmitter();
    constructor() {}

    ngOnDestroy(): void {
        this.popupDismiss.emit('closed');
    }

    
}