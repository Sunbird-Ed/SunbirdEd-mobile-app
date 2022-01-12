import { Component, Input, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';

@Component({
  selector: 'pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements OnInit {
  @Input() data;
  @Input() questionNumber;

  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: { position: 'bottom', align:'start'},
  };
  public pieChartLabels: Label[];
  public pieChartData: SingleDataSet;
  // = [75, 25];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public chartColors: Array<any>;
  //   = [
  //   {
  //     // all colors in order
  //     backgroundColor: ['#D35400', '#D35400', '#D35400'],
  //   },
  // ];

  constructor() {}

  ngOnInit() {
    this.pieChartLabels = this.data.chart.data.labels;
    this.pieChartData = this.data.chart.data.datasets[0].data;
    this.chartColors = [{ backgroundColor: this.data.chart.data.datasets[0].backgroundColor }];



  }
}
