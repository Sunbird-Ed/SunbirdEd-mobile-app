import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'support-acknowledgement',
    templateUrl: './support-acknowledgement.component.html',
    styleUrls: ['./support-acknowledgement.component.scss']
})
export class SupportAcknowledgement {
    @Output() closeEvents = new EventEmitter();
    @Input() boardContact: any;
    constructor(
        private translate: TranslateService
    ) {}

    close() {
        this.closeEvents.emit(true);
    }

    openDialpad() {
        window.open('tel:' + this.boardContact.contactinfo.number, '_system');
    }

}
