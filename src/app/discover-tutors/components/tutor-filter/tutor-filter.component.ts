import { Component, Output, EventEmitter } from '@angular/core';
 
@Component({
  selector: 'app-tutor-filter',
  templateUrl: './tutor-filter.component.html',
  styleUrls: ['./tutor-filter.component.scss']
})
export class TutorFilterComponent {
  @Output() filterChange = new EventEmitter<any>();
 
  applyFilter(filterData: any) {
    this.filterChange.emit(filterData);
  }
}