import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'matrix-chart',
  templateUrl: './matrix-chart.component.html',
  styleUrls: ['./matrix-chart.component.scss'],
})
export class MatrixChartComponent implements OnInit {
  @Input() data;
  @Input() questionNumber;
  @Output() allEvidence = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  allEvidenceClick($event) {
    debugger
    this.allEvidence.emit($event);
  }
}
