import { Component, Input, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements OnInit {
  @Input() data;
  @Input() questionNumber;
  Highcharts = Highcharts; // required
  chartConstructor = 'chart'; // optional string, defaults to 'chart'
  updateFlag = false; // optional boolean
  oneToOneFlag = true; // optional boolean, defaults to false
  runOutsideAngular = false;
  chartObj;

  constructor() {}

  ngOnInit() {
    if (this.data && this.data.chart && this.data.chart.data) {
      for (const outer of this.data.chart.data) {
        for (const inner of outer.data) {
          inner.y = parseInt(inner.y);
        }
      }
    }

    this.chartObj = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
      },
      title: {
        text: ' ',
      },
      tooltip: {
        // pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          // allowPointSelect: true,
          // cursor: 'pointer',
          showInLegend: true,
        },
      },
      series: this.data ? this.data.chart.data : null,
    };
    setTimeout(() => {
      Highcharts.chart('container' + this.questionNumber, this.chartObj);
    }, 1000);
  }
}
