import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pb-horizontal',
  templateUrl: './pb-horizontal.component.html',
  styleUrls: ['./pb-horizontal.component.scss'],
})
export class PbHorizontalComponent implements OnInit {
  // tslint:disable-next-line:no-input-rename
  @Input('progress') progress;
  // tslint:disable-next-line:no-input-rename
  @Input('isOnBoardCard') isOnBoardCard;
  @Input ('isCourseProgress') isCourseProgress;

  constructor() {
  }

  ngOnInit() {}

}
