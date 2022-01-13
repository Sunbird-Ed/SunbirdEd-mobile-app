import { Component, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js';
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent {
  // @ViewChild('doughnutCanvas', {static: false}) private doughnutCanvas: ElementRef;
  @ViewChild('doughnutCanvas', { static: false }) private doughnutCanvas: ElementRef;
  private doughnutChart: any;
  constructor() {
  }

  ngAfterViewInit() {
    this.setup();
  }
  setup() {
    console.log('in setup');
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: "doughnut",
      data: {
        labels: ["Completed", "Overdue", "Pending"],
        datasets: [
          {
            label: "",
            data: [12, 19, 3],
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)"
            ],
            hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: true,
          position: 'bottom',
          labels: {
              fontColor: '#333',
          }
      },
    }
    });
  }
}