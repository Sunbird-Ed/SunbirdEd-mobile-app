import { Directive, ElementRef, Renderer2, Input } from '@angular/core';
import { Events, IonContent } from '@ionic/angular';
import { Subject, Observable, Subscription} from 'rxjs-compat';

@Directive({
  selector: '[hide-header-footer]', // Attribute
  host: {
    '(ionScroll)': 'onContentScroll($event)',
    '(touchend)': 'onTouchEnd($event)',
    '(touchstart)': 'onTouchStart($event)',
  }
})
export class HideHeaderFooterDirective {

  private scrollEvent = new Subject<undefined>();
  private scrollEvent$ = this.scrollEvent.asObservable();

  private touchEndEvent = new Subject<undefined>();
  private touchEndEvent$ = this.touchEndEvent.asObservable();

  private scrollEventSubscription?: Subscription;

  constructor(private elemRef: ElementRef, private renderer: Renderer2, public event: Events) {}

  async onContentScroll(event: IonContent) {
    const scrollElement = await event.getScrollElement();
    if (scrollElement.scrollTop <= 58) {
      console.log(scrollElement.scrollTop);
      return;
    }

    this.scrollEvent.next(undefined);
  }

  onTouchStart(event) {
    this.hideHeaderFooter();
  }

  onTouchEnd(event) {
    this.touchEndEvent.next(undefined);
  }

  private hideHeaderFooter() {
    if (this.scrollEventSubscription) {
      return;
    }

    this.scrollEventSubscription = this.scrollEvent$
      .takeUntil(Observable.defer(() => {
        return this.touchEndEvent$.take(1).mergeMap(() => {
          return this.scrollEvent$.startWith(undefined).switchMap(() => Observable.timer(100).take(1));
        });
      }))
      .do(() => {
        const appRootRef: HTMLElement = document.getElementsByTagName('ion-app')[0] as HTMLElement;

        appRootRef.classList.add('hide-header-footer');
      })
      .finally(() => {
        const appRootRef: HTMLElement = document.getElementsByTagName('ion-app')[0] as HTMLElement;
        appRootRef.classList.remove('hide-header-footer');

        this.scrollEventSubscription.unsubscribe();
        this.scrollEventSubscription = undefined;
      })
      .subscribe();
  }
}
