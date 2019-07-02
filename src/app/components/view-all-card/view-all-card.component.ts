import { CommonUtilService } from '../../../services/common-util.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-all-card',
  templateUrl: './view-all-card.component.html',
  styleUrls: ['./view-all-card.component.scss'],
})
export class ViewAllCardComponent implements OnInit {
  text: string;
  defaultImg: string;
  @Input() content: any;
  @Input() type: any;
  @Input() sectionName: any;
  @Input() userId: any;

  constructor(
    public commonUtilService: CommonUtilService
  ) {
    this.defaultImg = 'assets/imgs/ic_launcher.png';
  }

  ngOnInit() {}

}
