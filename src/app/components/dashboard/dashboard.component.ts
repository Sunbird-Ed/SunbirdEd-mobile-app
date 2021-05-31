import {  Component, Input, OnInit } from '@angular/core';
@Component({
    selector: "dashboard-component",
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @Input() dashletData: any;
  DashletRowData = { values: [] };
  columnConfig = { columnConfig: [] };

  constructor(
) {
   
}

  ngOnInit() {
    this.DashletRowData.values = this.dashletData.rows;
    this.columnConfig.columnConfig = this.dashletData.columns;
  }

}