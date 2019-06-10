import {
  Directive,
  Input,
  ElementRef,
  AfterViewInit,
  HostListener,
  OnChanges
} from '@angular/core';

@Directive({
  selector: '[readMore]' // Attribute selector
})
export class ReadMoreDirective implements AfterViewInit, OnChanges {

  // tslint:disable-next-line:no-input-rename
  @Input('length') private maxLength: number;
  @Input('readMore') private text: string;
  @Input() private showMoreText: string;
  @Input() private showLessText: string;
  lessText = '';
  moreText = '';
  toggleState = false; // Show Less in the beginning
  hideToggle = true; // Dont show any Link for less or More before checking the length of the text.

  constructor(public el: ElementRef) { }

  public ngAfterViewInit() {
    if (this.text) {
      this.checkTextLength();
    }

    if (!this.hideToggle) {
      this.splitLessAndMoreText();
    }
  }

  ngOnChanges() {
    console.log('On Changes Triggered', this.text);
    this.ngAfterViewInit();
  }

  public checkTextLength() {
    this.hideToggle = ((this.text.length > this.maxLength) && this.maxLength > 0) ? false : true;
  }

  public splitLessAndMoreText() {
    this.lessText = this.breakString(this.text, 0, this.maxLength);
    this.moreText = this.breakString(this.text, this.maxLength, this.text.length);
    this.showLessText = this.showLessText || 'Show Less';
    this.showMoreText = this.showMoreText || 'Show More';
    this.setText();
  }

  public breakString(inputString, from, to) {
    return inputString.slice(from, to);
  }

  public setText() {
    if (this.toggleState) { // Means Show Less Button
      this.el.nativeElement.innerHTML = this.lessText + this.moreText + '<a> ' + this.showLessText + '</a>';
    } else {  // Means Show button More
      this.el.nativeElement.innerHTML = this.lessText + '...' + '<a>' + this.showMoreText + '</a>';
    }
  }

  @HostListener('click', ['$event.target']) onClick(e) {
    this.toggleState = !this.toggleState;
    this.setText();
  }
}
