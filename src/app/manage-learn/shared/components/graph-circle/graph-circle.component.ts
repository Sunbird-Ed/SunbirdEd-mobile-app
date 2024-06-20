import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartType, ChartOptions, Plugin } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'graph-circle',
  templateUrl: './graph-circle.component.html',
  styleUrls: ['./graph-circle.component.scss'],
})
export class GraphCircleComponent implements OnChanges {
  @Input() data: any;
  total: number;

  public doughnutChartLabels: string[] = [];
  public doughnutChartData: number[] = [];
  public doughnutChartType: ChartType = 'doughnut';

  public chartColors: Array<any> = [];
  extraColor: string[] = [];

  public chartPlugins: Plugin[] = [DataLabelsPlugin];

  public chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 5,
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'start',
        font: {
          size: 8,
        },
        formatter: (value) => {
          const perc = ((value * 100) / this.total).toFixed(1) + '%';
          return perc;
        },
      },
    },
    cutout: '80%',
  };

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.data = changes.data.currentValue;
      this.plotSimpleBarChart();
    }
  }

  plotSimpleBarChart() {
    this.extraColor = [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 206, 86)',
      'rgb(231, 233, 237)',
      'rgb(75, 192, 192)',
      'rgb(151, 187, 205)',
      'rgb(220, 220, 220)',
      'rgb(247, 70, 74)',
      'rgb(70, 191, 189)',
      'rgb(253, 180, 92)',
      'rgb(148, 159, 177)',
      'rgb(77, 83, 96)',
      'rgb(95, 101, 217)',
      'rgb(170, 95, 217)',
      'rgb(140, 48, 57)',
      'rgb(209, 6, 40)',
      'rgb(68, 128, 51)',
      'rgb(125, 128, 51)',
      'rgb(128, 84, 51)',
      'rgb(179, 139, 11)',
    ];
    this.doughnutChartLabels = this.data.series_new.label;
    this.doughnutChartData = this.data.series_new.data;
    this.total = this.data.series_new.total;
    this.chartOptions.cutout = `${this.data.series_new.radius}%`;
    
    if (this.data.series_new.color.length) {
      this.data.series_new.color.forEach((c) => {
        this.extraColor.splice(c.pos, 0, c.color);
      });
      this.data.series_new.color = this.extraColor;
      this.chartColors = [{ backgroundColor: this.data.series_new.color }];
    } else {
      this.chartColors = [{ backgroundColor: this.extraColor }];
    }
  }
}

