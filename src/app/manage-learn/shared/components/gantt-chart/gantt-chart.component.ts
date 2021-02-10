import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';
import 'chartjs-plugin-datalabels';


@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss'],
})
export class GanttChartComponent implements OnInit {
  @ViewChild('ganttChartCanvas', { static: false }) private ganttChartCanvas: ElementRef;
  @ViewChild('ganttChartCanvas1', { static: false }) private ganttChartCanvas1: ElementRef;

  private ganttChart: Chart;
  private ganttChart1: Chart;
  show: boolean;
  constructor() {}
  ngAfterViewInit() {
    this.setup();
  }
  setup() {
    // console.log('in setup');
    // this.ganttChart = new Chart(this.ganttChartCanvas.nativeElement, {
    //   type: 'line',
    //   data: {
    //     datasets: [
    //       {
    //         label: 'Scatter Dataset',
    //         backgroundColor: 'rgba(246,156,85,1)',
    //         borderColor: 'rgba(246,156,85,1)',
    //         fill: false,
    //         borderWidth: 15,
    //         pointRadius: 0,
    //         data: [
    //           {
    //             x: 0,
    //             y: new Date(),
    //           },
    //           {
    //             x: 3,
    //             y: new Date(),
    //           },
    //         ],
    //       },
    //       {
    //         backgroundColor: 'rgba(208,255,154,1)',
    //         borderColor: 'rgba(208,255,154,1)',
    //         fill: false,
    //         borderWidth: 15,
    //         pointRadius: 0,
    //         data: [
    //           {
    //             x: 1,
    //             y: new Date(),
    //           },
    //           {
    //             x: 2,
    //             y: new Date(),
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   options: {
    //     legend: {
    //       display: false,
    //     },
    //     scales: {
    //       xAxes: [
    //         {
    //           type: 'linear',
    //           position: 'top',
    //           ticks: {
    //             // beginAtzero: true,
    //             stepSize: 1,
    //           },
    //         },
    //       ],
    //       yAxes: [
    //         {
    //           // scaleLabel: {
    //           //   display: false
    //           // },
    //           ticks: {
    //             beginAtZero: true,
    //             max: 100,
    //           },
    //         },
    //       ],
    //     },
    //   },
    // });
    // this.ganttChart1 = new Chart(this.ganttChartCanvas1.nativeElement, {
    //   type: 'horizontalBar',
    //   data: {
    //     labels: ['task1', 'task 2', 'task 3', 'Task 4'],
    //     datasets: [
    //       {
    //         label: 'Population (millions)',
    //         backgroundColor: ['#3e95cd', '#8e5ea2', '#3cba9f', '#e8c3b9'],
    //         data: [1468959781804, 1469029434776, 1469199218634, 1469457574527],
    //       },
    //     ],
    //   },
    //   options: {
    //     legend: { display: false },
    //     title: {
    //       display: true,
    //       text: 'Predicted world population (millions) in 2050',
    //     },
    //     scales: {
    //       // x: {
    //       //     type: 'time',
    //       //     time: {
    //       //         unit: 'month'
    //       //     }
    //       // }
    //     },
    //   },
    // });
  }

  MS_PER_DAY = 1000 * 60 * 60 * 24;

  data = [
    { task: 'Task 1', startDate: '2018-04-08 00:00:00.000', endDate: '2018-06-08 00:00:00.000' },
    { task: 'Task 2', startDate: '2018-05-08 00:00:00.000', endDate: '2018-07-19 00:00:00.000' },
    { task: 'Task 3', startDate: '2018-07-08 00:00:00.000', endDate: '2020-09-08 00:00:00.000' },
  ];

  chartData;
  options;
  plantingDays = '2018-04-01 00:00:00.000';

  lables = ['Task 1', 'Task 2', 'Task 3'];
  // stages = ['VP', 'VE', 'V6', 'VTR1'];

  createChart() {
    const that = this;
    this.chartData = {
      // labels: this.data.map(t => t.task),
      labels: this.lables,
      datasets: [
        {
          data: this.data.map((t) => {
            return this.dateDiffInDays(new Date(this.plantingDays), new Date(t.startDate));
          }),
          datalabels: {
            color: '#025ced',
            formatter: function (value, context) {
              return '';
            },
          },
          backgroundColor: 'rgba(63,103,126,0)',
          hoverBackgroundColor: 'rgba(50,90,100,0)',
        },
        {
          data: this.data.map((t) => {
            return this.dateDiffInDays(new Date(t.startDate), new Date(t.endDate));
          }),
          datalabels: {
            color: '#025ced',
            formatter: function (value, context) {
              return '';
            },
          },
        },
      ],
    };

    this.options = {
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'Project title',
      },
      legend: { display: false },
      tooltips: {
        mode: 'index',
        callbacks: {
          label: function (tooltipItem, d) {
            let label = d.datasets[tooltipItem.datasetIndex].label || '';
            const date = new Date(that.plantingDays);
            if (tooltipItem.datasetIndex === 0) {
              const diff = that.dateDiffInDays(date, new Date(that.data[tooltipItem.index].startDate));
              date.setDate(diff + 1);
              label += 'Start Date: ' + that.getDate(date);
            } else if (tooltipItem.datasetIndex === 1) {
              const diff = that.dateDiffInDays(date, new Date(that.data[tooltipItem.index].endDate));
              date.setDate(diff + 1);
              label += 'End Date: ' + that.getDate(date);
            }
            return label;
          },
        },
      },
      scales: {
        xAxes: [
          {
            stacked: true,
            ticks: {
              callback: function (value, index, values) {
                const date = new Date(that.plantingDays);
                date.setDate(value);
                return that.getDate(date);
              },
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
          },
        ],
      },
    };
    this.show=true
  }

  getDate(date) {
    return (
      date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).substr(-2) + '-' + ('0' + date.getDate()).substr(-2)
    );
  }

  dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / this.MS_PER_DAY);
  }

  ngOnInit() {
    this.createChart();
  }
}
