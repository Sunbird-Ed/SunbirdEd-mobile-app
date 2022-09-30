import { Injectable } from '@angular/core';

@Injectable()
export class TextbookTocService {

    textbookIds = {
        contentId: undefined,
        rootUnitId: undefined,
        unit: undefined,
        content: undefined
    };

    constructor(
    ) { 
        console.log('textbook-toc-service');    
    }

    setTextbookIds(textbookIds) {
        this.textbookIds = textbookIds;
        console.log('this.TextbookIds in service', this.textbookIds);
    }

    resetTextbookIds() {
        this.textbookIds = {
            contentId: undefined,
            rootUnitId: undefined,
            unit: undefined,
            content: undefined
        };
    }

}
