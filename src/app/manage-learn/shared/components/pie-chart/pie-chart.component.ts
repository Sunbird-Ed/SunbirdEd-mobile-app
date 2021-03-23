import { Component, Input, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';

@Component({
  selector: 'pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements OnInit {
  @Input() data;
  @Input() questionNumber;
  // Highcharts = Highcharts; // required
  // chartConstructor = 'chart'; // optional string, defaults to 'chart'
  // updateFlag = false; // optional boolean
  // oneToOneFlag = true; // optional boolean, defaults to false
  // runOutsideAngular = false;
  // chartObj;

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

    // if (this.data && this.data.chart && this.data.chart.data) {
    //   for (const outer of this.data.chart.data) {
    //     for (const inner of outer.data) {
    //       inner.y = parseInt(inner.y);
    //     }
    //   }
    // }

    // this.chartObj = {
    //   chart: {
    //     plotBackgroundColor: null,
    //     plotBorderWidth: null,
    //     plotShadow: false,
    //     type: 'pie',
    //   },
    //   title: {
    //     text: ' ',
    //   },
    //   tooltip: {
    //     // pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    //   },
    //   plotOptions: {
    //     pie: {
    //       // allowPointSelect: true,
    //       // cursor: 'pointer',
    //       showInLegend: true,
    //     },
    //   },
    //   series: this.data ? this.data.chart.data : null,
    // };
    // setTimeout(() => {
    //   Highcharts.chart('container' + this.questionNumber, this.chartObj);
    // }, 1000);
  }
}
