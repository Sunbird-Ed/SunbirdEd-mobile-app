import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import variablepie from 'highcharts/modules/variable-pie.src';
variablepie(Highcharts);
@Component({
  selector: 'graph-circle',
  templateUrl: './graph-circle.component.html',
  styleUrls: ['./graph-circle.component.scss'],
})
export class GraphCircleComponent implements OnInit {
  @Input() data;
  highcharts = Highcharts;
  chartConstructor = 'chart'; // optional string, defaults to 'chart'
  runOutsideAngular = false;

  chartOption;
  constructor() {}
  ngOnInit() {}

  plotSimpleBarChart() {
    this.chartOption = {
      chart: {
        type: 'variablepie',
        height: '65%',
        marginTop: 30,
      },
      tooltip: { enabled: false },
      legend: {
        align: 'center',
        verticalAlign: this.data.legendPosition || 'bottom',
        layout: 'horizontal',
        x: 50,
        y: 0,
        useHTML: true,
        width: this.data.series[0].data.length > 1 ? 400 : 200,
        itemWidth: this.data.series[0].data.length > 1 ? 200 : 200,
        labelFormatter: function () {
          return '<div style="width:100%;margin-bottom:10px">' + this.name + '</div>';
        },
      },
      plotOptions: {
        variablepie: {
          // innerSize: "60%",
          dataLabels: {
            enabled: true,
            // format: "{point.value}",
            formatter: function () {
              return this.y ? this.point.value : null;
            },
          },
        },
      },
      title: {
        text: '',
        verticalAlign: 'middle', // to put text inside circle
        // y: 10,
      },
      series: this.data.series,
    };

    console.log(JSON.stringify(this.chartOption));
  }

  ngOnChanges(changes: SimpleChanges) {
    this.data.series = changes.data.currentValue['series'];
    this.plotSimpleBarChart();
  }
}
