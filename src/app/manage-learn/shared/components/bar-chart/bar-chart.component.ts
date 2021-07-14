import { Component, Input, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';

@Component({
  selector: 'bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit {
  @Input() data;
  @Input() questionNumber;
  // Highcharts = Highcharts; // required
  // chartConstructor = 'chart'; // optional string, defaults to 'chart'
  // updateFlag = false; // optional boolean
  // oneToOneFlag = true; // optional boolean, defaults to false
  // runOutsideAngular = false;
  // chartObj;

  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      xAxes: [
        {
          ticks: {
            min: 0, // Edit the value according to what you need,
            max: 100,
          },
          scaleLabel: {
            display: true,
            labelString: 'Response in %',
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            callback: function (value: any, index, values) {
              // // return createSubstrArr(value, 5) || value;
              let strArr = value.split(' ');
              let tempString = '';
              let result = [];
              for (let x = 0; x < strArr.length; x++) {
                tempString += ' ' + strArr[x];
                if ((x % 4 === 0 && x !== 0) || x == strArr.length - 1) {
                  tempString = tempString.slice(1);
                  result.push(tempString);
                  tempString = '';
                }
              }
              return result || value;
            },
            fontSize: 12,
          },
          display: true,

          scaleLabel: {
            display: true,
            labelString: 'Response',
          },
        },
      ],
    },
  };
  public barChartLabels: Label[];
  // = ['Option A', 'Option B'];
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = false;
  public barChartPlugins;
  public chartColors: Array<any>;

  //   = [
  //   {
  //     // all colors in order
  //     backgroundColor: ['#D35400', '#D35400', '#D35400'],
  //   },
  // ];

  public barChartData: ChartDataSets[];
  // =[{ data: [65, 59], label: 'Series A' }];

  constructor() {}

  ngOnInit() {
    this.barChartLabels = this.data.chart.data.labels;
    this.barChartData = [{ data: this.data.chart.data.datasets[0].data, label: 'Series A' }];
    this.chartColors = [{ backgroundColor: this.data.chart.data.datasets[0].backgroundColor }];
    this.barChartPlugins = [
      {
        beforeUpdate: function (c) {
          var chartHeight = c.chart.height;
          var size = (chartHeight * 5) / 100;
          c.scales['y-axis-0'].options.ticks.minor.fontSize = size;
        },
      },
    ];

    // if (this.data && this.data.chart && this.data.chart.data) {
    //   for (const instance of this.data.chart.data) {
    //     const array = [];
    //     for (let value of instance.data) {
    //       array.push(parseFloat(value));
    //     }
    //     instance.data = array;
    //   }
    // }

    // this.chartObj = {
    //   chart: {
    //     plotBackgroundColor: null,
    //     plotBorderWidth: null,
    //     plotShadow: false,
    //     type: this.data.chart.type ? this.data.chart.type : 'bar',
    //   },
    //   title: {
    //     text: ' ',
    //   },
    //   xAxis: this.data.chart.xAxis,
    //   yAxis: this.data.chart.yAxis,
    //   tooltip: {
    //     // pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    //   },
    //   plotOptions: this.data.chart.plotOptions
    //     ? this.data.chart.plotOptions
    //     : {
    //         bar: {
    //           dataLabels: {
    //             enabled: false,
    //           },
    //           showInLegend: false,
    //         },
    //       },
    //   series: this.data.chart.data,
    //   legend: this.data.chart.legend
    //     ? this.data.chart.legend
    //     : {
    //         enabled: false,
    //       },
    // };
    // setTimeout(() => {
    //   Highcharts.chart('container'+this.questionNumber, this.chartObj);
    // }, 1000);
  }
}
function createSubstrArr(str, words): any {
  let strArr = str.split(' ');
  let tempString = '';
  let result = [];
  for (let x = 0; x < strArr.length; x++) {
    tempString += ' ' + strArr[x];
    if ((x % words === 0 && x !== 0) || x == strArr.length - 1) {
      tempString = tempString.slice(1);
      result.push(tempString);
      tempString = '';
    }
  }
  return result;
}
