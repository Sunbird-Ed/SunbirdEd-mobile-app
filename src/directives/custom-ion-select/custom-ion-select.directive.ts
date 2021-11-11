import { Directive, DoCheck, ElementRef } from '@angular/core';

@Directive({
  selector: '[appCustomIonSelect]'
})
export class CustomIonSelectDirective implements DoCheck {

    constructor(private ref: ElementRef) {}

    ngDoCheck() {
        try {
            this.updateStyle();
        } catch (e) {

        }
    }

    updateStyle() {
        const nativeElement = (this.ref.nativeElement as HTMLElement);

        const ionSelectRef = nativeElement.querySelector('ion-select');

        if (!ionSelectRef) {
            return;
        }

        const selectTextRef = ionSelectRef.shadowRoot.querySelector('.select-text');
        const selectTextPlaceholderRef = ionSelectRef.shadowRoot.querySelector('.select-text.select-placeholder');
        const selectIconInnerRef = ionSelectRef.shadowRoot.querySelector('.select-icon-inner');

        if (nativeElement.classList.contains('ion-valid')) {
            if (selectTextRef) {
                selectTextRef.setAttribute(
                    'style',
                    `font-weight: bold;
                    color: #333333;
                    padding-left: 10px;`.trim()
                );
            }

            if (selectIconInnerRef) {
                selectIconInnerRef.setAttribute(
                    'style',
                    `border-color: #333333;
                    animation: none;
                    border:solid;
                    border-width: 0 2px 2px 0;
                    display: inline-block;
                    padding: 4px;
                    transform: rotate(45deg) translateY(-50%);`.trim()
                );
            }
        } else if (nativeElement.classList.contains('item-select-disabled')) {
            if (selectTextPlaceholderRef) {
                selectTextPlaceholderRef.setAttribute(
                    'style',
                    `color: #4D4D4D !important;
                    padding-left: 10px;
                    opacity: 1;`.trim()
                );
            }

            if (selectIconInnerRef) {
                selectIconInnerRef.setAttribute(
                    'style',
                    `border-color: #4D4D4D !important;
                    animation: none;
                    border: solid;
                    border-width: 0 2px 2px 0;
                    display: inline-block;
                    padding: 4px;
                    transform: rotate(45deg) translateY(-50%);
                    opacity: 1;`.trim()
                );
            }
        } else if (nativeElement.classList.contains('ion-invalid')) {
            if (selectTextPlaceholderRef) {
                selectTextPlaceholderRef.setAttribute('style',
                    `color: #006de5;
                    padding-left: 10px;
                    opacity: inherit`.trim()
                );
            }

            if (selectIconInnerRef) {
                selectIconInnerRef.setAttribute(
                    'style',
                    `border: solid #006de5;
                    opacity:1;
                    border-width: 0 2px 2px 0;
                    display: inline-block;
                    padding: 4px;
                    transform: rotate(45deg) translateY(-50%);
                    animation: upDownAnimate 5s linear infinite;
                    animation-duration: 0.9s;`.trim()
                );
            }
        }
    }
}
