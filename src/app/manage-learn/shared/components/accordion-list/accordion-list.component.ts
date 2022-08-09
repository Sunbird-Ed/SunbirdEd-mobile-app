import { Component, OnInit, Input, Output, EventEmitter,ViewChild } from '@angular/core';
@Component({
  selector: 'app-accordion-list',
  templateUrl: './accordion-list.component.html',
  styleUrls: ['./accordion-list.component.scss'],
})
export class AccordionListComponent implements OnInit {
  @Input() data: any;
  @Input() title: any;
  @Input() showCard :boolean = true;
  @Output() actionEvent = new EventEmitter();
  isListItemOpened : boolean = false;
  constructor() { }

  ngOnInit() { }

  action(event) {
    this.actionEvent.emit(event)
  }
  toggleAccordion(): void {
    this.isListItemOpened = !this.isListItemOpened;
  }
}
