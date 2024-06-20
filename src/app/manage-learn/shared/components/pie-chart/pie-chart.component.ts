import { Component, Input, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
@Component({
  selector: 'pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent {
  @Input() data;
  @Input() questionNumber;
  public chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom', 
        align:'start'
      },
    },
  };
  constructor() {
  }
}
