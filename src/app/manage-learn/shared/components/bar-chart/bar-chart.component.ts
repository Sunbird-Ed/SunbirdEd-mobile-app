import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ChartType, ChartDataset } from "chart.js";

@Component({
  selector: 'bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit {
  @Input() data;
  @Input() questionNumber;
  @ViewChild("chartRootElement") chartRootElement;
  @ViewChild("chartCanvas") chartCanvas;

  public barChartLabels = [];
  public barChartType: ChartType = "bar";
  public barChartLegend = true;
  public chartColors: Array<any>;

  public barChartData: ChartDataset[];
  barData: any;
  barChartOptions: any;
  constructor() {}

  ngOnInit() {
    this.barData = this.data?.chart?.data;
    const options = {
      ...(this.data.chart.type == "horizontalBar" && {
        indexAxis: "y",
      }),
      plugins: {
        ...((this.data.chart.options.legend && {
          legend: this.data.chart.options.legend,
        }) || {
          legend: {
            display: false,
          },
        }),
      },
      scales: {
        x: {
          ...(this.data.chart.options.scales.xAxes[0].scaleLabel && {
            title: {
              display:
                this.data.chart.options.scales.xAxes[0].scaleLabel.display,
              text: this.data.chart.options.scales.xAxes[0].scaleLabel
                .labelString,
            },
            ...this.data.chart.options.scales.xAxes[0],
          }),
        },
        y: {
          ...(this.data.chart.options.scales.yAxes[0].scaleLabel && {
            title: {
              display:
                this.data.chart.options.scales.yAxes[0].scaleLabel.display,
              text: this.data.chart.options.scales.yAxes[0].scaleLabel
                .labelString,
            },
            ...this.data.chart.options.scales.yAxes[0],
          }),
        },
      },
    };
    this.barChartOptions = options;
  }
}
