import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.scss'],
})
export class ScatterChartComponent implements OnInit {
  @Input() data;
  @Input() questionNumber;
  // Highcharts = Highcharts; // required
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
        type: 'scatter',
      },
      xAxis: this.data.chart.xAxis,
      yAxis: this.data.chart.yAxis,
      title: {
        text: ' ',
      },
      tooltip: {
        // pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        scatter: {
          lineWidth: 2,
        },
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      series: this.data ? this.data.chart.data : null,
    };
    setTimeout(() => {
      // Highcharts.chart('container' + this.questionNumber, this.chartObj);
    }, 1000);
  }
}
