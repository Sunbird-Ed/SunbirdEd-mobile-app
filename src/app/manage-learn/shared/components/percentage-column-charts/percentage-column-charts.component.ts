import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import * as stackedBar from 'chartjs-plugin-stacked100';

@Component({
  selector: 'percentage-column-charts',
  templateUrl: './percentage-column-charts.component.html',
  styleUrls: ['./percentage-column-charts.component.scss'],
})
export class PercentageColumnChartsComponent implements OnInit {
  // @Output() clickOnGraphEventEmit = new EventEmitter();
  @Input() chartData;
  submiisionDateArray;
  //  =[
  //   '25th feb 2019',
  //   '26th Feb 2019',
  //   '25th feb 2019',
  //   '26th Feb 2019',
  //   '25th feb 2019',
  //   '26th Feb 2019',
  //   '25th feb 2019',
  //   '26th Feb 2019',
  // ];

  // dataPack1 = [1, 3, 2, 3, 3, 4, 4, 1];
  // dataPack2 = [2, 3, 3, 4, 4, 5, 5, 6];
  // dataPack3 = [3, 4, 4, 5, 5, 6, 6, 7];
  // dataPack4 = [4, 4, 5, 7, 6, 5, 7, 1];
  public barChartData: ChartDataSets[];
  // =
  //   [
  //   {
  //     label: 'L1',
  //     data: this.dataPack1,
  //   },
  //   {
  //     label: 'L2',
  //     data: this.dataPack2,
  //   },
  //   {
  //     label: 'L3',
  //     data: this.dataPack3,
  //   },
  //   {
  //     label: 'L4',
  //     data: this.dataPack4,
  //   },
  // ];

  public barChartOptions: ChartOptions;
  //   = {

  //   scales: {
  //     xAxes: [
  //       {
  //         stacked: false,
  //         gridLines: { display: false },
  //         scaleLabel: {
  //           display: true,
  //           labelString: 'Criteria',
  //         },
  //       },
  //     ],
  //     yAxes: [
  //       {
  //         stacked: true,
  //         ticks: {
  //           fontSize: 7,
  //         },
  //       },
  //     ],
  //   },
  //   plugins: {
  //     stacked100: { enable: true, replaceTooltipLabel: true },
  //     datalabels: {
  //       offset: 0,
  //       anchor: 'end',
  //       align: 'left',
  //       font: {
  //         size: 7,
  //       },
  //       formatter: (value, data) => {
  //         const d: any = data.chart.data;
  //         const { datasetIndex, dataIndex } = data;
  //         if ((data.datasetIndex + 1) % this.barChartData.length == 0) {
  //           // console.log(data.datasetIndex)
  //           if (d.originalData[datasetIndex][dataIndex] == 1) {
  //             return ['', '', this.submiisionDateArray[data.dataIndex]];
  //           }
  //           return [
  //             `                                              ${d.originalData[datasetIndex][dataIndex]}`,
  //             '',

  //             `                                ${this.submiisionDateArray[data.dataIndex]}`,
  //           ];
  //         } else {
  //           return `${d.originalData[datasetIndex][dataIndex]}`;
  //         }
  //       },
  //     },
  //   },
  // };
  public barChartLabels: Label[];
  //   = [
  //   'domain1,domain1,domain1',
  //   '',
  //   'domain2',
  //   '',
  //   'domain3',
  //   '',
  //   'domain4,domain1domain1,domain',
  //   '',
  // ];
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = true;
  public barChartPlugins = [pluginDataLabels, stackedBar];

  constructor() {}

  ngOnInit() {
    this.submiisionDateArray = this.chartData.chart.submissionDateArray;
    this.barChartData = this.chartData.chart.data.datasets;
    this.barChartLabels = this.chartData.chart.data.labels;
    this.barChartOptions = {
      scales: {
        xAxes: [
          {
            stacked: false,
            gridLines: { display: false },
            scaleLabel: {
              display: true,
              labelString: 'Criteria',
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
            ticks: {
              fontSize: 7,
            },
          },
        ],
      },
      plugins: {
        stacked100: { enable: true, replaceTooltipLabel: true },
        datalabels: {
          offset: 0,
          anchor: 'end',
          align: 'left',
          font: {
            size: 7,
          },
          formatter: (value, data) => {
            const d: any = data.chart.data;
            const { datasetIndex, dataIndex } = data;
            if (this.submiisionDateArray && !this.submiisionDateArray.length) {
              return value
            }
              if ((data.datasetIndex + 1) % this.barChartData.length == 0) {
                // console.log(data.datasetIndex)
                if (d.originalData[datasetIndex][dataIndex] == 1) {
                  return ['', '', this.submiisionDateArray[data.dataIndex]];
                }
                return [
                  `                                              ${d.originalData[datasetIndex][dataIndex]}`,
                  '',

                  `                                ${this.submiisionDateArray[data.dataIndex]}`,
                ];
              } else {
                return `${d.originalData[datasetIndex][dataIndex]}`;
              }
          },
        },
      },
    };
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent; active: {}[] }): void {
    // console.log(event, active);
  }
}
