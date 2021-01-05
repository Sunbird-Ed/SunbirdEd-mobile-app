import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'matrix-chart',
  templateUrl: './matrix-chart.component.html',
  styleUrls: ['./matrix-chart.component.scss'],
})
export class MatrixChartComponent implements OnInit {
  @Input() data;
  @Input() questionNumber;

  constructor() {}

  ngOnInit() {}
}
