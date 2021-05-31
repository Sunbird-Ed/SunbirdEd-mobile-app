import {  Component, Inject, Input, OnInit, ElementRef, Output, EventEmitter } from '@angular/core';
import { RouterLinks } from '@app/app/app.constant';

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
    //   this.fetchDashboardConfig();
      console.log('dashletData in comp', this.dashletData); 
      this.DashletRowData.values = this.dashletData.rows;
      this.columnConfig.columnConfig = this.dashletData.columns;

  }

//   fetchDashboardConfig() {
   
//   }

}