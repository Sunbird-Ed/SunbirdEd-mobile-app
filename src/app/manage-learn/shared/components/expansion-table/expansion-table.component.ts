import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'expansion-table',
  templateUrl: './expansion-table.component.html',
  styleUrls: ['./expansion-table.component.scss'],
})
export class ExpansionTableComponent implements OnInit {
  @Input() datas;

  constructor() {}

  ngOnInit() {}
}
