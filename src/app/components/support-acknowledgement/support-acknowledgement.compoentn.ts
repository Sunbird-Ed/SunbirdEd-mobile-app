import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'support-acknowledgement',
    templateUrl: './support-acknowledgement.compoentn.html',
    styleUrls: ['./support-acknowledgement.compoentn.scss']
})
export class SupportAcknowledgement {
    @Output() closeEvents = new EventEmitter();
    @Input() boardContact: any;
    constructor() {}

    close() {
        this.closeEvents.emit(true);
    }

    openDialpad() {
        window.open("tel:" + this.boardContact.contactinfo.number, "_system");
        // window.open("tel:" + this.boardContact.contactinfo.number, "_blank"); 
    }

}