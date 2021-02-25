import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ChartType } from 'chart.js';
import { MultiDataSet, Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'graph-circle',
  templateUrl: './graph-circle.component.html',
  styleUrls: ['./graph-circle.component.scss'],
})
export class GraphCircleComponent implements OnInit {
  @Input() data;
  total;
  chartConstructor = 'chart'; // optional string, defaults to 'chart'
  runOutsideAngular = false;

  chartOption;

  public doughnutChartLabels: Label[];
  // = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
  public doughnutChartData: MultiDataSet;
  // = [[350, 450, 100]];
  public doughnutChartType: ChartType = 'doughnut';

  public chartColors: Array<any>;
  extraColor = ['#FFA971', '#F6DB6C', '#98CBED', '#C9A0DA', '#5DABDC', '#88E5B0'];

  public chartPlugins = [
    pluginDataLabels,
    {
      beforeInit: function (chart, options) {
        chart.legend.afterFit = function () {
          this.height += 20;
        };
      },
    },
  ];

  private chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 80,
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        padding: 25,
      },
    },
    layout: {
      padding: {
        top: 10,
      },
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
        font: {
          size: 10,
        },
        formatter: (value) => {
          var perc = ((value * 100) / this.total).toFixed(1) + '%';
          return perc;
        },
      },
    },
  };

  constructor() {}
  ngOnInit() {}

  plotSimpleBarChart() {
    // this.chartOption = {
    //   chart: {
    //     type: 'variablepie',
    //     height: '65%',
    //     marginTop: 30,
    //   },
    //   tooltip: { enabled: false },
    //   legend: {
    //     align: 'center',
    //     verticalAlign: this.data.legendPosition || 'bottom',
    //     layout: 'horizontal',
    //     x: 50,
    //     y: 0,
    //     useHTML: true,
    //     width: this.data.series[0].data.length > 1 ? 400 : 200,
    //     itemWidth: this.data.series[0].data.length > 1 ? 200 : 200,
    //     labelFormatter: function () {
    //       return '<div style="width:100%;margin-bottom:10px">' + this.name + '</div>';
    //     },
    //   },
    //   plotOptions: {
    //     variablepie: {
    //       // innerSize: "60%",
    //       dataLabels: {
    //         enabled: true,
    //         // format: "{point.value}",
    //         formatter: function () {
    //           return this.y ? this.point.value : null;
    //         },
    //       },
    //     },
    //   },
    //   title: {
    //     text: '',
    //     verticalAlign: 'middle', // to put text inside circle
    //     // y: 10,
    //   },
    //   series: this.data.series,
    // };

    console.log(JSON.stringify(this.chartOption));

    this.doughnutChartLabels = this.data.series_new.label;
    this.doughnutChartData = this.data.series_new.data;
    this.total = this.data.series_new.total;
    this.chartOptions.cutoutPercentage = this.data.series_new.radius;
    if (this.data.series_new.color.length) {
      this.data.series_new.color.map((c, i) => {
        this.extraColor.splice(c.pos, 0, c.color);
      });
      // this.data.series_new.color = [...this.data.series_new.color, ...this.extraColor];
      this.data.series_new.color = this.extraColor;
      this.chartColors = [{ backgroundColor: this.data.series_new.color }];
    } else {
      this.chartColors = [
        //defualt 12 ng2chart color in FE and BE + 8 more colors
        {
          backgroundColor: [
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
          ],
        },
      ];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.data.series = changes.data.currentValue['series'];
    this.data.series_new = changes.data.currentValue['series_new'];
    this.plotSimpleBarChart();
  }
}
