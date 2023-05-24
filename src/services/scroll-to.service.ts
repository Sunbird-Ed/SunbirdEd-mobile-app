import {Injectable} from '@angular/core';
import {IonContent} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class ScrollToService {

    constructor() {
    }

    scrollTo(elementId: string, options?: boolean | ScrollIntoViewOptions): void {
        const element = document.getElementById(elementId);
        if (!element) {
            return;
        }
        element.scrollIntoView(options || {
            behavior: 'smooth'
        });
    }

    scrollToWithinContent(content: IonContent, elementId: string): void {
        const y = document.getElementById(elementId).offsetTop;
        content.scrollToPoint(0, y, 500).then().catch(err => console.error(err));
    }
}
