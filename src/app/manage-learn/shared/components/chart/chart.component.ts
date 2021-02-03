import { Component, ViewChild, OnInit, ElementRef, Input } from '@angular/core';
import { Chart } from 'chart.js';
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  @Input() data;
  // @ViewChild('doughnutCanvas', {static: false}) private doughnutCanvas: ElementRef;
  @ViewChild('doughnutCanvas', {static: false}) private doughnutCanvas: ElementRef;
  private doughnutChart: any;
  constructor() { 
  }

  ngOnInit() {
  
  }
  ngAfterViewInit() {
    this.setup();
  }
  setup(){
    this.doughnutChart =new Chart(this.doughnutCanvas.nativeElement, {
      type: "doughnut",
      data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets:  this.data.series
      }
    });
  }
}