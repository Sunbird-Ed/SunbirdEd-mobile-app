import { Component, Input } from '@angular/core';

@Component({
  selector: 'expansion-table',
  templateUrl: './expansion-table.component.html',
  styleUrls: ['./expansion-table.component.scss'],
})
export class ExpansionTableComponent {
  @Input() datas;

  constructor() {}

}
