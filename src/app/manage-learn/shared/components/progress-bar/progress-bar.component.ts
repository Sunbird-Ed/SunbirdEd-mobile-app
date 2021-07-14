import { Component, Input } from '@angular/core';

@Component({
  selector: 'progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent {

  @Input() progress = 0;
  @Input()total = 0;
  @Input()completed = 0;
  @Input() showTracker ;

  constructor() { }


}
