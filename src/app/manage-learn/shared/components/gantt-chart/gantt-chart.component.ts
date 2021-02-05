import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';

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
  constructor() { }
  ngAfterViewInit() {
    this.setup();
  }
  ngOnInit() { }
  setup() {
    console.log('in setup');
    this.ganttChart = new Chart(this.ganttChartCanvas.nativeElement, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Scatter Dataset',
            backgroundColor: "rgba(246,156,85,1)",
            borderColor: "rgba(246,156,85,1)",
            fill: false,
            borderWidth: 15,
            pointRadius: 0,
            data: [
              {
                x: 0,
                y: new Date(),
              }, {
                x: 3,
                y: new Date(),
              }
            ]
          },
          {
            backgroundColor: "rgba(208,255,154,1)",
            borderColor: "rgba(208,255,154,1)",
            fill: false,
            borderWidth: 15,
            pointRadius: 0,
            data: [
              {
                x: 1,
                y: new Date(),
              }, {
                x: 2,
                y: new Date(),
              }
            ]
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'top',
            ticks: {
              beginAtzero: true,
              stepSize: 1
            }
          }],
          yAxes: [{
            // scaleLabel: {
            //   display: false
            // },
            ticks: {
              beginAtZero: true,
              max: 100
            }
          }]
        }
      }
    });

    this.ganttChart1 = new Chart(this.ganttChartCanvas1.nativeElement, {
      type: 'horizontalBar',
      data: {
        labels: ['task1', 'task 2', 'task 3', 'Task 4'],
        datasets: [
          {
            label: "Population (millions)",
            backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9"],
            data: [new Date(), new Date(), new Date(), new Date()]
          }
        ]
      },
      options: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Predicted world population (millions) in 2050'
        },
        scales: {
          x: {
              type: 'time',
              time: {
                  unit: 'month'
              }
          }
      }
      }
    })
  }
}
