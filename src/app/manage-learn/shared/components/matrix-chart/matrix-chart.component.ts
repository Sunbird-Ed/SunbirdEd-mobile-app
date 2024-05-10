import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'matrix-chart',
  templateUrl: './matrix-chart.component.html',
  styleUrls: ['./matrix-chart.component.scss'],
})
export class MatrixChartComponent {
  @Input() data;
  @Input() questionNumber;
  @Output() allEvidence = new EventEmitter();
  constructor() {}


  allEvidenceClick($event) {
    this.allEvidence.emit($event);
  }
}
