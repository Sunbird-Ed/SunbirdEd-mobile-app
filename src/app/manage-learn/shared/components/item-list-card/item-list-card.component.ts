import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonUtilService } from '@app/services';

@Component({
  selector: 'app-item-list-card',
  templateUrl: './item-list-card.component.html',
  styleUrls: ['./item-list-card.component.scss'],
})
export class ItemListCardComponent implements OnChanges {
  @Input() title: any;
  @Input() subTitle: any;
  @Input() description:any;
  @Input() case:any ={subTitle:'titleCase', description:'titleCase'}
  @Input() id: any;
  @Output() cardSelect = new EventEmitter();
  @Input() ellipsis:Boolean =false
  @Input() arrIndex:any;
  @Input() selectedEvidenceIndex:any;
  constructor(private commonUtilService: CommonUtilService) {}

  ngOnChanges(changes: SimpleChanges): void {
  }
  isNumber(val): boolean {
    return typeof val === 'number';
  }
 
  programDetails(id){
    this.cardSelect.emit(id);
  }
}
