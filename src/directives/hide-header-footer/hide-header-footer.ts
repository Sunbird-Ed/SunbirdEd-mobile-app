import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { Events } from '../../util/events';
import { defer, Subject, Subscription, timer } from 'rxjs';
import { finalize, mergeMap, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

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

  async onContentScroll(event) {
    const scrollElement = await event.target.getScrollElement();
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

    this.scrollEventSubscription = this.scrollEvent$.pipe(
      takeUntil(defer(() => {
        return this.touchEndEvent$.pipe(
          take(1),
          mergeMap(() => {
            return this.scrollEvent$.pipe(
              startWith(undefined),
              switchMap(() =>
                timer(100).pipe(
                  take(1)
                )
              )
            );
          })
        );
      })),
      tap(() => {
        const appRootRef: HTMLElement = document.getElementsByTagName('app-root')[0] as HTMLElement;

        appRootRef.classList.add('hide-header-footer');
      }),
      finalize(() => {
        const appRootRef: HTMLElement = document.getElementsByTagName('app-root')[0] as HTMLElement;
        appRootRef.classList.remove('hide-header-footer');

        this.scrollEventSubscription.unsubscribe();
        this.scrollEventSubscription = undefined;
      })
    ).subscribe();
  }
}
