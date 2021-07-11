import { Component, OnInit } from '@angular/core';
import { CommonUtilService } from '@app/services';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item-list-card',
  templateUrl: './item-list-card.component.html',
  styleUrls: ['./item-list-card.component.scss'],
})
export class ItemListCardComponent implements OnInit {
  @Input() title: any;
  @Input() subTitle: any;
  @Input() id: any;
  @Output() cardSelect = new EventEmitter();
  @Input() ellipsis:Boolean =false

  constructor(private commonUtilService: CommonUtilService) {}

  ngOnInit() {}
  isNumber(val): boolean {
    return typeof val === 'number';
  }

  programDetails(id) {
    this.cardSelect.emit(id);
  }
}
