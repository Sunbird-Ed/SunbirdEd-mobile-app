import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import * as stackedBar from 'chartjs-plugin-stacked100';

@Component({
  selector: 'percentage-column-charts',
  templateUrl: './percentage-column-charts.component.html',
  styleUrls: ['./percentage-column-charts.component.scss'],
})
export class PercentageColumnChartsComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas;
  @Input() chartData;
  submiisionDateArray: string[];

  public barChartData: ChartDataset<'bar'>[];
  public barChartOptions: ChartOptions<'bar'>;
  public barChartLabels: string[];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [pluginDataLabels, stackedBar];

  constructor() {}

  ngOnInit() {
    this.submiisionDateArray = this.chartData.chart.submissionDateArray;
    this.barChartData = this.chartData.chart.data.datasets;
    this.barChartLabels = this.chartData.chart.data.labels;

    const options = {
      ...(this.chartData.chart.type === 'horizontalBar' && {
        indexAxis: 'y',
      }),
      scales: {
        x: {
          stacked: false,
          grid: { display: false },
          ...(this.chartData.chart.options.scales?.xAxes?.[0]?.scaleLabel && {
            title: {
              display: this.chartData.chart.options.scales.xAxes[0].scaleLabel.display,
              text: this.chartData.chart.options.scales.xAxes[0].scaleLabel.labelString,
            },
          }),
        },
        y: {
          stacked: true,
          ...(this.chartData.chart.options.scales?.yAxes?.[0]?.scaleLabel && {
            title: {
              display: this.chartData.chart.options.scales.yAxes[0].scaleLabel.display,
              text: this.chartData.chart.options.scales.yAxes[0].scaleLabel.labelString,
            },
          }),
          ticks: {
            font: { size: 7 },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align:'center',
        } || this.chartData.chart.options.legend,
        stacked100: { enable: true, replaceTooltipLabel: true },
        datalabels: {
          offset: 0,
          anchor: 'end',
          align: 'start',
          font: {
            size: 12,
          },
          formatter: (value, context) => {
            const d: any = context.chart.data;
            const { datasetIndex, dataIndex } = context;

            if (d.originalData[datasetIndex][dataIndex] == 0) {
              if ((datasetIndex + 1) % this.barChartData.length == 0 && this.submiisionDateArray.length) {
                return ['', '', this.submiisionDateArray[dataIndex]];
              }
              return '';
            }
            // to remove date in instance report
            if (this.submiisionDateArray && !this.submiisionDateArray.length) {
              return `${d.originalData[datasetIndex][dataIndex]}`;
            }

            if (( datasetIndex + 1) % this.barChartData.length == 0) {
              if (d.originalData[datasetIndex][dataIndex] == 1) {
                return ['', '', this.submiisionDateArray[dataIndex]];
              }
              return [
                `                                              ${d.originalData[datasetIndex][dataIndex]}`,
                '',
                `                                ${this.submiisionDateArray[dataIndex]}`,
              ];
            } else {
              return `${d.originalData[datasetIndex][dataIndex]}`;
            }
          },
        },
      },
    };

    this.barChartOptions = options as ChartOptions<'bar'>;
  }

  public chartClicked({ event, active }: { event: MouseEvent; active: {}[] }): void {}
}
